import path from 'path';
import fs from 'fs';
import csv from 'csv-parse/lib/sync';

import Transaction from '../models/Transaction';

import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';

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
    const csvFilePath = path.join(uploadConfig.directory, csvFileName);

    const file = await fs.promises.readFile(csvFilePath);
    const transactionArray = csv(file, { columns: true, trim: true });

    const transactions: Transaction[] = [];

    for (const data of transactionArray) {
      const { title, value, type, category } = data;
      const createTransactionService = new CreateTransactionService();
      const transaction = await createTransactionService.execute({
        title,
        value,
        type,
        category,
      });
      transactions.push(transaction);
    }

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

    return transactions;
  }
}

export default ImportTransactionsService;
