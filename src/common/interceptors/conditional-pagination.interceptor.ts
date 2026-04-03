import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class ConditionalPaginationInterceptor<T> implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ConditionalPaginationInterceptor<T>> {
    const { query } = context.switchToHttp().getRequest();
    const isPagingRequested = query.page || query.limit;

    return next.handle().pipe(
      map((response) => {
        if (
          !isPagingRequested &&
          response?.data &&
          Array.isArray(response.data)
        ) {
          return response.data;
        }
        return response;
      }),
    );
  }
}
