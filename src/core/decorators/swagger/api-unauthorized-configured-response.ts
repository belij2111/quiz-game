import { applyDecorators } from '@nestjs/common';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';

/**
 * Decorator for specifying a 401 Unauthorized response with a description.
 *
 * @param description Description of the response ('Unauthorized' by default).
 *
 * @publicApi
 */

export function ApiUnauthorizedConfiguredResponse(
  description: string = 'Unauthorized',
) {
  return applyDecorators(ApiUnauthorizedResponse({ description }));
}
