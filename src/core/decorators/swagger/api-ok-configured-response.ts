import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginatedViewModel } from '../../models/base-paginated.view-model';

/**
 * Decorator for configuring successful API responses with pagination support.
 *
 * This decorator allows for easy configuration of API responses for successful requests,
 * adding the ability to use a pagination model. If the `isPaginated` parameter is set to `true`,
 * the response will include a paginated model containing an array of items. Otherwise, a standard
 * response with the specified model will be returned.
 *
 * @param {any} model The data model to be used in the response.
 * @param {string} [description='Success'] A description of the successful response (default is 'Success').
 * @param {boolean} [isPaginated=true] Indicates whether to use pagination in the response (default is true).
 *
 * @publicApi
 */

export function ApiOkConfiguredResponse(
  model: any,
  description?: string,
  isPaginated: boolean = true,
) {
  const finalDescription = description || 'Success';
  if (isPaginated) {
    return applyDecorators(
      ApiExtraModels(model, PaginatedViewModel),
      ApiOkResponse({
        description: finalDescription,
        schema: {
          allOf: [
            { $ref: getSchemaPath(PaginatedViewModel) },
            {
              properties: {
                items: {
                  type: 'array',
                  items: { $ref: getSchemaPath(model) },
                },
              },
            },
          ],
        },
      }),
    );
  }
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({ description: finalDescription, type: model }),
  );
}
