import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const CurrentDeviceId = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();
    if (!request.deviceId) {
      throw new UnauthorizedException(
        `Device id ${request.deviceId} not found`,
      );
    }
    return request.deviceId;
  },
);
