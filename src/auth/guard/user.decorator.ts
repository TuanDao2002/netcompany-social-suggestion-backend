import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CommonConstant } from '../../common/constant';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.getArgByIndex(CommonConstant.EXECUTION_CONTEXT_REQ_INDEX);
    return req.user? req.user : null;
  },
);
