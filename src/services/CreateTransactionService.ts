// import AppError from '../errors/AppError';
import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CategoriesRepository from '../repositories/CategoriesRepository';

import Transaction from '../models/Transaction';
import CreateCategoryService from './CreateCategoryService';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category_title: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category_title,
  }: Request): Promise<Transaction> {
    const categoriesRepository = getCustomRepository(CategoriesRepository);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    if (type === 'income' || type === 'outcome') {
      const findCategory = await categoriesRepository.findByName(
        category_title,
      );

      const balance = await transactionsRepository.getBalance();

      if (type === 'outcome' && value > balance.income) {
        throw new AppError('insuficient income.', 400);
      }

      let category_id;
      if (findCategory) {
        category_id = findCategory.id;
      } else {
        const createCategory = new CreateCategoryService();
        const category = createCategory.execute(category_title);
        category_id = (await category).id;
      }

      const transaction = transactionsRepository.create({
        title,
        type,
        value,
        category_id,
      });

      await transactionsRepository.save(transaction);

      return transaction;
    }

    throw new Error('Only income or outcome types valid.');
  }
}

export default CreateTransactionService;
