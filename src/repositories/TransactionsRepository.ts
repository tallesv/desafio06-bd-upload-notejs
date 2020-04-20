import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactionsRepository = getRepository(Transaction);

    const transactions = await transactionsRepository.find();

    const income = transactions.reduce(
      (previousValue, transaction) =>
        transaction.type === 'income'
          ? +previousValue + +transaction.value
          : 0 + +previousValue,
      0,
    );

    const outcome = transactions.reduce(
      (previousValue, transaction) =>
        transaction.type === 'outcome'
          ? +previousValue + +transaction.value
          : 0 + +previousValue,
      0,
    );

    return { income, outcome, total: income - outcome };
  }
}

export default TransactionsRepository;
