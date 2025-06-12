import { applyDecorators } from '@nestjs/common';
import { ApiNoContentResponse } from '@nestjs/swagger';

/**
 * Decorator for specifying a 204 No Content response with an optional description.
 *
 * This decorator configures the API response to indicate that the request was successful
 * but there is no content to return. It allows for a custom description to be provided,
 * with a default value of 'No Content'
 *
 * @param description Description of the response ('No Content' by default).
 *
 * @publicApi
 */

export function ApiNoContentConfiguredResponse(
  description: string = 'No Content',
) {
  return applyDecorators(ApiNoContentResponse({ description }));
}
