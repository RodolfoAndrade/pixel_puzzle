import { Injectable } from '@angular/core'; 
import { HttpClient } from '@angular/common/http'; 
import { timeout } from 'rxjs/internal/operators/timeout';

@Injectable({ 
	providedIn: 'root'
}) 
export class ApiService { 
	constructor(private http: HttpClient) { } 
  getImage() {
    return this.http.get(
      'https://54.232.180.189:3000/api/image'
    ).pipe(timeout(1000));
  }
}