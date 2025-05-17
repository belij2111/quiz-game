import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserViewModel } from './models/view/user.view-model';
import {
  GetUsersQueryParams,
  CreateUserInputModel,
} from './models/input/create-user.input-model';
import { BasicAuthGuard } from '../../../../core/guards/basic-auth.guard';
import { ApiBasicAuth } from '@nestjs/swagger';
import { PaginatedViewModel } from '../../../../core/models/base-paginated.view-model';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../application/use-cases/create-user.use-case';
import { DeleteUserCommand } from '../application/use-cases/delete-user.use-case';
import { GetAllUsersQuery } from '../application/queries/get-all-users.query';
import { GetUserByIdQuery } from '../application/queries/get-user-by-id.query';

@Controller('/sa/users')
@UseGuards(BasicAuthGuard)
@ApiBasicAuth()
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() userCreateModel: CreateUserInputModel) {
    const createdUserId = await this.commandBus.execute(
      new CreateUserCommand(userCreateModel),
    );
    return await this.queryBus.execute(new GetUserByIdQuery(createdUserId));
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Query()
    inputQuery: GetUsersQueryParams,
  ): Promise<PaginatedViewModel<UserViewModel[]>> {
    return await this.queryBus.execute(new GetAllUsersQuery(inputQuery));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    const deletionResult: boolean = await this.commandBus.execute(
      new DeleteUserCommand(id),
    );
    if (!deletionResult) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }
}
