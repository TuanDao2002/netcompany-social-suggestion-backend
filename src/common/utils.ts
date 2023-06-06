import { isNumberString } from 'class-validator';
import {
  Period,
  PricePerPerson,
} from '../modules/location/dto/create-location.dto';

export class Utils {
  public static validatePeriod(period: Period) {
    const { openTime, closeTime } = period;
    return (
      openTime &&
      closeTime &&
      openTime < closeTime &&
      openTime >= '0000' &&
      openTime <= '2359' &&
      closeTime >= '0000' &&
      closeTime <= '2359'
    );
  }

  public static validatePriceRange(priceRange: PricePerPerson) {
    return priceRange.min < priceRange.max;
  }

  public static removeSpace = (str: string) => {
    return str.replace(/\s+/g, ' ').trim().replace(/\s+,/g, ',');
  };
}
