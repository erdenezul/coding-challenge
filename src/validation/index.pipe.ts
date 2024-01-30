import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { isCuid } from '@paralleldrive/cuid2';

@Injectable()
export class ParseCuidPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!isCuid(value)) {
      throw new BadRequestException(`Value must be cuid in ${metadata}`);
    }
    return value;
  }
}
