import fs from 'fs';
import csv from 'csv-parse';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

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

    await Promise.all(
      transactions.map(async t => {
        createdTransactions.push(
          await createTransaction.execute({
            title: t.title,
            type: t.type,
            value: t.value,
            category_title: t.category,
          }),
        );
      }),
    );

    return createdTransactions;
  }
}

export default ImportTransactionsService;
