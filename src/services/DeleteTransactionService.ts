import { getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionRepository = getRepository(Transaction);

    const checkTransactionExists = await transactionRepository.findOne(id);

    if (!checkTransactionExists) {
      throw new AppError('This transaction does not exists', 400);
    }

    // await transactionRepository.delete({ id });
    await transactionRepository.remove(checkTransactionExists);
  }
}

export default DeleteTransactionService;
