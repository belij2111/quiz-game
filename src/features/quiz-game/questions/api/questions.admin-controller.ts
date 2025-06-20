import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBasicAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BasicAuthGuard } from '../../../../core/guards/basic-auth.guard';
import { ApiCreatedConfiguredResponse } from '../../../../core/decorators/swagger/api-created-configured-response';
import { ApiBadRequestConfiguredResponse } from '../../../../core/decorators/swagger/api-bad-request-configured-response';
import { ApiUnauthorizedConfiguredResponse } from '../../../../core/decorators/swagger/api-unauthorized-configured-response';
import {
  CreateQuestionInputDto,
  GetQuestionsQueryParams,
} from './input-dto/create-question.input-dto';
import { QuestionViewDto } from './view-dto/question.view-dto';
import { ApiOkConfiguredResponse } from '../../../../core/decorators/swagger/api-ok-configured-response';
import { ApiNoContentConfiguredResponse } from '../../../../core/decorators/swagger/api-no-content-configured-response';
import { ApiNotFoundConfiguredResponse } from '../../../../core/decorators/swagger/api-not-found-configured-response';
import { UpdateQuestionInputDto } from './input-dto/update-question.input-dto';
import { UpdatePublishInputDto } from './input-dto/update-publish.input-dto';

@Controller('sa/quiz/questions')
@UseGuards(BasicAuthGuard)
@ApiBasicAuth()
@ApiTags('QuizQuestions')
export class QuestionsAdminController {
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create question' })
  @ApiCreatedConfiguredResponse(QuestionViewDto)
  @ApiBadRequestConfiguredResponse()
  @ApiUnauthorizedConfiguredResponse()
  async create(@Body() createQuestionInputDto: CreateQuestionInputDto) {
    return {
      message: 'Created question',
      inputQuestion: createQuestionInputDto,
      viewQuestion: 'QuestionViewDto',
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Return all questions with pagination and filtering',
  })
  @ApiOkConfiguredResponse(QuestionViewDto)
  @ApiUnauthorizedConfiguredResponse()
  async getAll(@Query() query: GetQuestionsQueryParams) {
    return {
      message: 'Get all questions',
      inputQuery: query,
      viewQuestion: 'QuestionViewDto',
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update question' })
  @ApiNoContentConfiguredResponse()
  @ApiBadRequestConfiguredResponse()
  @ApiUnauthorizedConfiguredResponse()
  @ApiNotFoundConfiguredResponse()
  async update(
    @Param('id') id: string,
    @Body() updateQuestionInputDto: UpdateQuestionInputDto,
  ) {
    const result = {
      id: id,
      message: 'Updated question',
      inputQuestion: updateQuestionInputDto,
    };
    console.log(result);
  }

  @Put(':id/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Publish/unpublish question' })
  @ApiNoContentConfiguredResponse()
  @ApiBadRequestConfiguredResponse()
  @ApiUnauthorizedConfiguredResponse()
  async updatePublish(
    @Param('id') id: string,
    @Body() updatePublishInputDto: UpdatePublishInputDto,
  ) {
    const result = {
      id: id,
      message: 'Updated publish',
      inputPublish: updatePublishInputDto,
    };
    console.log(result);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete question' })
  @ApiNoContentConfiguredResponse()
  @ApiUnauthorizedConfiguredResponse()
  @ApiNotFoundConfiguredResponse()
  async delete(@Param('id') id: string) {
    const result = {
      id: id,
      message: 'Deleted question',
    };
    console.log(result);
  }
}
