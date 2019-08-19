import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { mergeMap, catchError } from 'rxjs/operators';


@Injectable({
    providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
    /*
    constructor(
        private authService: AuthService
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.authService.token.value;
        return next.handle(this.addToken(request, token));
    }


    addToken(request: HttpRequest<any>, token: any): HttpRequest<any> {
        return request.clone({ setHeaders: { Authorization: 'Bearer ' + token } });
    }
    */
   constructor(private auth: AuthService) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return this.auth.getTokenSilently$().pipe(
      mergeMap(token => {
        const tokenReq = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        });
        return next.handle(tokenReq);
      }),
      catchError(err => throwError(err))
    );
  }
}