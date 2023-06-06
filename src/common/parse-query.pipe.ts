import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import queryString from 'qs';

@Injectable()
export class QueryParamsTransformPipe implements PipeTransform {
  transform(obj: any, metadata: ArgumentMetadata) {
    let result: any = queryString.parse(obj);
    for (const key of Object.keys(result)) {
      if (!isNaN(parseFloat(result[key])) && isFinite(result[key])) {
        result[key] = Number(result[key]);
      }
    }
    return result;
  }
}
