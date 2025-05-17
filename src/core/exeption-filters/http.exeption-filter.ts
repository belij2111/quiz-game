import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  message: string | string[];
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === HttpStatus.BAD_REQUEST) {
      const errorsResponse: { errorsMessages: string[] } = {
        errorsMessages: [],
      };
      const responseBody: ErrorResponse =
        exception.getResponse() as ErrorResponse;
      if (responseBody.message) {
        if (Array.isArray(responseBody.message)) {
          responseBody.message.forEach((e) =>
            errorsResponse.errorsMessages.push(e),
          );
        } else {
          errorsResponse.errorsMessages.push(responseBody.message);
        }
      }

      response.status(status).json(errorsResponse);
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
