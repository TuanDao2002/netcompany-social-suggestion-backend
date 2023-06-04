import { CookieOptions } from "express";

export class CommonConstant {
  public static readonly PORT = 8080;
  public static readonly MAX_AGE = 30 * 24 * 3600 * 1000;
  public static readonly TOKEN_EXPIRE_IN = '30d';
  public static readonly EXECUTION_CONTEXT_REQ_INDEX = 0;
  public static readonly NETCOMPANY_EMAIL_REGEX = /^[\w-\.]+@netcompany.com$/;
  public static readonly COOKIE_OPTIONS: CookieOptions = {
    maxAge: CommonConstant.MAX_AGE,
    httpOnly: true,
    sameSite: "strict",
    path: '/',
  };

  public static readonly TimeRegex = /^\d{4}$/;

  public static readonly LOCATION_PAGINATION_LIMIT = 5;
}
