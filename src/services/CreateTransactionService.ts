import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import Transaction from '../models/Transaction';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    const balance = await transactionRepository.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError(
        'You do not have enough balance to make this transaction',
        400,
      );
    }

    let currentCategory = await categoryRepository.findOne({ title: category });
    if (!currentCategory) {
      currentCategory = await categoryRepository.save({ title: category });
    }

    const transaction = await transactionRepository.create({
      title,
      value,
      type,
      category: currentCategory,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
