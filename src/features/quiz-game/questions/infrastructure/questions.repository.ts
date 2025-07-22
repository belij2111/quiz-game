import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Question } from '../domain/questions.entity';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class QuestionsRepository {
  private getRepo(manager?: EntityManager) {
    return (
      manager?.getRepository(Question) ||
      this.dataSource.getRepository(Question)
    );
  }
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(question: Question, manager?: EntityManager): Promise<string> {
    const result = await this.getRepo(manager).save(question);
    return result.id;
  }

  async update(
    id: string,
    foundQuestion: Question,
    manager?: EntityManager,
  ): Promise<boolean | null> {
    const result = await this.getRepo(manager).update(id, foundQuestion);
    return (result.affected ?? 0) > 0 ? true : null;
  }

  async delete(id: string, manager?: EntityManager): Promise<boolean | null> {
    const result = await this.getRepo(manager).softDelete({ id: id });
    return (result.affected ?? 0) > 0 ? true : null;
  }

  async findByIdOrNotFoundFail(
    id: string,
    manager?: EntityManager,
  ): Promise<Question> {
    const foundQuestion = await this.findById(id, manager);
    if (!foundQuestion) {
      throw new NotFoundException(`Question with id ${id} not found`);
    }
    return foundQuestion;
  }

  async findById(
    id: string,
    manager?: EntityManager,
  ): Promise<Question | null> {
    return await this.getRepo(manager).findOneBy({ id: id });
  }

  async findRandomPublishedQuestions(
    count: number,
    manager?: EntityManager,
  ): Promise<Question[]> {
    return this.getRepo(manager)
      .createQueryBuilder('q')
      .where('q.published = :published', { published: true })
      .orderBy('RANDOM()')
      .limit(count)
      .getMany();
  }
}
