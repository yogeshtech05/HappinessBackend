import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Wraps every controller response into the consistent envelope used by both
 * the storefront and the admin panel: `{ success: true, ...payload }`.
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((result) => {
        if (result && typeof result === 'object' && 'success' in result) {
          return result;
        }
        if (result === undefined || result === null) {
          return { success: true };
        }
        if (Array.isArray(result)) {
          return { success: true, data: result };
        }
        if (typeof result === 'object') {
          return { success: true, ...(result as Record<string, unknown>) };
        }
        return { success: true, data: result };
      }),
    );
  }
}
