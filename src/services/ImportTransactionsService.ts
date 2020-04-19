import path from 'path';
import fs from 'fs';
import csv from 'csv-parse';

import { getRepository, In } from 'typeorm';
import Transaction from '../models/Transaction';

import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  csvFileName: string;
}
interface CreateTransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class ImportTransactionsService {
  async execute({ csvFileName }: Request): Promise<Transaction[]> {
    const categoryRepository = getRepository(Category);
    const transactionsRepository = getRepository(Transaction);

    const csvFilePath = path.join(uploadConfig.directory, csvFileName);

    const transactions: CreateTransactionDTO[] = [];

    const parseCSV = fs
      .createReadStream(csvFilePath)
      .pipe(csv({ columns: true, trim: true }));

    parseCSV.on('data', async row => {
      transactions.push(row);
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const existentCategory = await categoryRepository.find({
      title: In(transactions.map(transaction => transaction.category)),
    });

    const newCategories = await categoryRepository.create(
      transactions
        .map(transaction => ({ title: transaction.category }))
        .filter(
          newCat =>
            !existentCategory
              .map(existCat => existCat.title)
              .includes(newCat.title),
        )
        .filter(
          (value, index, self) =>
            self.findIndex(idx => idx.title === value.title) === index,
        ),
    );
    await categoryRepository.save(newCategories);
    const categories = [...newCategories, ...existentCategory];

    const createdTransactions = await transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        value: transaction.value,
        type: transaction.type,
        category: categories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(createdTransactions);

    /** METODO 1 */
    // const file = await fs.promises.readFile(csvFilePath);
    // const transactionArray = csv(file, { columns: true, trim: true });

    // const transactions: Transaction[] = [];

    // for (const data of transactionArray) {
    //   const { title, value, type, category } = data;
    //   const createTransactionService = new CreateTransactionService();
    //   const transaction = await createTransactionService.execute({
    //     title,
    //     value,
    //     type,
    //     category,
    //   });
    //   transactions.push(transaction);
    // }

    /** METODO 2 */
    // const promises: Transaction[] = transactionArray.map(
    //   async ({ title, value, type, category }: CreateTransactionDTO) => {
    //     const createTransactionService = new CreateTransactionService();
    //     const transaction = await createTransactionService.execute({
    //       title,
    //       value,
    //       type,
    //       category,
    //     });
    //     return transaction;
    //   },
    // );
    // const transactions = await Promise.all(promises);

    await fs.promises.unlink(csvFilePath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
