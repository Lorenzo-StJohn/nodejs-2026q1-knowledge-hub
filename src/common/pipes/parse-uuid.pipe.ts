import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseUUIDPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    const uuidV4Regex =
      /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
    const isValid = uuidV4Regex.test(value);
    if (!isValid) {
      throw new BadRequestException('ID should be valid UUID v4');
    }
    return value;
  }
}
