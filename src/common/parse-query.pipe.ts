import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
} from '@nestjs/common';
import queryString from "qs";

@Injectable()
export class QueryParamsTransformPipe implements PipeTransform {
  transform(obj: any, metadata: ArgumentMetadata) {
    const result = queryString.parse(obj);
    return result;
  }
}
