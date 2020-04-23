import fs from 'fs';
import csv from 'csv-parse';

import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';
import TransactionRepository from '../repositories/TransactionsRepository';
import CategoriesRepository from '../repositories/CategoriesRepository';

interface TransactionCSV {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(path: string): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();
    const transactions: TransactionCSV[] = [];

    const file = fs.createReadStream(path);

    const parsers = csv({
      from_line: 2,
    });

    const parseCSV = file.pipe(parsers);

    parseCSV.on('data', async row => {
      const [title, type, value, category] = row.map((data: string) =>
        data.trim(),
      );

      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const createdTransactions: Transaction[] = [];

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < transactions.length; i++) {
      createdTransactions.push(
        // eslint-disable-next-line no-await-in-loop
        await createTransaction.execute({
          title: transactions[i].title,
          type: transactions[i].type,
          value: transactions[i].value,
          category_title: transactions[i].category,
        }),
      );
    }

    await fs.promises.unlink(path);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
