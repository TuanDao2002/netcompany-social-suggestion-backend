export class CommonConstant {
  public static readonly PORT = 8080;
  public static readonly MAX_AGE = 30 * 24 * 3600 * 1000;
  public static readonly TOKEN_EXPIRE_IN = '30d';
  public static readonly EXECUTION_CONTEXT_REQ_INDEX = 0;
  public static readonly NETCOMPANY_EMAIL_REGEX = /^[\w-\.]+@netcompany.com$/;
}
