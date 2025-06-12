import { applyDecorators } from '@nestjs/common';
import { ApiCreatedResponse, ApiExtraModels } from '@nestjs/swagger';

/**
 *
 * Decorator for configuring successful API responses with the 201 (Created) code.
 *
 * This decorator simplifies the configuration of API responses for successful requests
 * by adding the ability to use the specified data model. It's automatic
 * sets the response code 201 and includes a description of the response.
 *
 * @param {any} model The data model to be used in the response.
 * @param {string} [description='Created'] A description of the successful response (default is 'Created').
 *
 * @publicApi
 */

export function ApiCreatedConfiguredResponse(
  model: any,
  description: string = 'Created',
) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiCreatedResponse({ description, type: model }),
  );
}
