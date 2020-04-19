import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const balance = {
      income: 0,
      outcome: 0,
      total: 0,
    };

    balance.total = transactions.reduce((sum, transaction) => {
      balance[transaction.type] += transaction.value;
      return (
        sum + transaction.value * (transaction.type === 'outcome' ? -1 : 1)
      );
    }, 0);

    return balance;
  }
}

export default TransactionsRepository;
