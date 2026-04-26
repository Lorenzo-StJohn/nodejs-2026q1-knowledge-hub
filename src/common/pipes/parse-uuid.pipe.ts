import { PipeTransform, Injectable } from '@nestjs/common';
import { ValidationError } from '../exceptions/custom-errors';

@Injectable()
export class ParseUUIDPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    const uuidV4Regex =
      /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
    const isValid = uuidV4Regex.test(value);
    if (!isValid) {
      throw new ValidationError();
    }
    return value.toLowerCase();
  }
}
