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

  public static removeZipcode(address: string) {
    address = this.removeSpace(address);
    let arr = address.split(','); // split the address into parts

    // remove zip code in city
    let city = arr[arr.length - 2];
    if (city && city.includes(' ')) {
      let partsOfCity = city.split(' ').map((part) => this.removeSpace(part));

      if (partsOfCity.length > 2) {
        arr[arr.length - 2] = partsOfCity.slice(0, -1).join(' ');
      }
    }

    return arr.join(','); // join the parts back together
  }

  public static removeSpace = (str: string) => {
    return str.replace(/\s+/g, ' ').trim().replace(/\s+,/g, ',');
  };
}
