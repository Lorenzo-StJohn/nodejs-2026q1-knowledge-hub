import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Go to http://localhost:4000/doc/ see documentation (replace 4000 with your port)';
  }
}
