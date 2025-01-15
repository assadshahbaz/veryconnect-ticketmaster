import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class HttpAPIInterceptor implements HttpInterceptor {
  constructor(private toastr: ToastrService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap(
        (event) => {
          if (event instanceof HttpResponse && request.method !== 'GET') {
            this.toastr.success('Request successful!');
          }
        },
        (error: any) => {
          if (error instanceof HttpErrorResponse) {
            let errorMessage = 'An error occurred.';

            if (error.error instanceof ErrorEvent) {
              // Client-side error
              errorMessage = `Client-side Error: ${error.error.message}`;
            } else {
              // Server-side error
              errorMessage = `Server-side Error: ${error.status} - ${error.message}`;
            }

            this.toastr.error(errorMessage, 'Error');
          }
        }
      ),
      catchError((error) => {
        // Handle errors for all requests, including GET
        let errorMessage = 'An error occurred.';
        if (error instanceof HttpErrorResponse) {
          if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = `Client-side Error: ${error.error.message}`;
          } else {
            // Server-side error
            errorMessage = `Server-side Error: ${error.status} - ${error.message}`;
          }
        }
        this.toastr.error(errorMessage, 'Error');
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}