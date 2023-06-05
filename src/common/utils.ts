import { isNumberString } from "class-validator";
import {
  Period,
  PricePerPerson,
} from '../modules/location/dto/create-location.dto';

export class Utils {
  public static validatePeriod(period: Period) {
    return period.openTime < period.closeTime;
  }

  public static validatePriceRange(priceRange: PricePerPerson) {
    return priceRange.min < priceRange.max;
  }

  public static removeSpace = (str: string) => {
    return str.replace(/\s+/g, ' ').trim().replace(/\s+,/g, ',');
  };
}
