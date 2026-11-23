import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let error = 'Internal server error';

    if (exception instanceof HttpException) {
      const payload = exception.getResponse();
      if (typeof payload === 'string') {
        error = payload;
      } else if (payload && typeof payload === 'object') {
        const message = (payload as Record<string, unknown>).message;
        if (Array.isArray(message)) {
          error = message.join(', ');
        } else if (typeof message === 'string') {
          error = message;
        } else {
          error = exception.message;
        }
      }
    } else if (exception instanceof Error) {
      error = exception.message;
    }

    const requestId = (request as Request & { requestId?: string }).requestId;
    if (status >= 500) {
      this.logger.error(
        `[${requestId ?? 'unknown'}] ${request.method} ${request.url} -> ${error}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json({
      success: false,
      error,
      statusCode: status,
      requestId,
    });
  }
}
