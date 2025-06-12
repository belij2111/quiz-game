import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse } from '@nestjs/swagger';

/**
 * Decorator for specifying a 404 Not Found response with an optional description.
 *
 * This decorator configures the API response to indicate that the requested resource
 * could not be found. It allows for a custom description to be provided, with a default
 * value of 'Not Found'.
 *
 * @param description Description of the response ('Not Found' by default).
 *
 * @publicApi
 */

export function ApiNotFoundConfiguredResponse(
  description: string = 'Not Found',
) {
  return applyDecorators(ApiNotFoundResponse({ description }));
}
