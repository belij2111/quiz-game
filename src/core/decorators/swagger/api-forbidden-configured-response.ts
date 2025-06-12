import { applyDecorators } from '@nestjs/common';
import { ApiForbiddenResponse } from '@nestjs/swagger';

/**
 * Decorator for specifying a 403 Forbidden response with an optional description.
 *
 * This decorator configures the API response to indicate that the requested resource
 * may be forbidden.This means that the server understands the client's request but refuses
 * to grant *access for various reasons.
 * It allows for a custom description to be provided, with a default value of 'Forbidden'.
 *
 * @param description Description of the response ('Forbidden' by default).
 *
 * @publicApi
 */

export function ApiForbiddenConfiguredResponse(
  description: string = 'Forbidden',
) {
  return applyDecorators(ApiForbiddenResponse({ description }));
}
