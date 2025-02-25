import { createParamDecorator } from '@nestjs/common';

interface IRequest extends Request {
  user: { sub: string; refreshToken: string }; // Update this with your actual user type
}

export const GetUser = createParamDecorator((req: IRequest) => req.user);
