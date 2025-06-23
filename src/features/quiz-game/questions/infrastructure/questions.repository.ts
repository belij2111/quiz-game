import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../domain/questions.entity';
import { Repository } from 'typeorm';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
  ) {}

  async create(question: Question): Promise<string> {
    const result = await this.questionsRepository.save(question);
    return result.id;
  }

  async update(id: string, foundQuestion: Question): Promise<boolean | null> {
    const result = await this.questionsRepository.update(id, foundQuestion);
    return (result.affected ?? 0) > 0 ? true : null;
  }

  async delete(id: string): Promise<boolean | null> {
    const result = await this.questionsRepository.softDelete({ id: id });
    return (result.affected ?? 0) > 0 ? true : null;
  }

  async findByIdOrNotFoundFail(id: string): Promise<Question> {
    const foundQuestion = await this.findById(id);
    if (!foundQuestion) {
      throw new NotFoundException(`Question with id ${id} not found`);
    }
    return foundQuestion;
  }

  async findById(id: string): Promise<Question | null> {
    return await this.questionsRepository.findOneBy({ id: id });
  }
}
