import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto, SignupDto } from './dtos';
import { Tokens } from './types';
import { AtGuard, IRequest, RtGuard } from 'src/common/guards';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signuplocal(@Body() dto: SignupDto): Promise<Tokens> {
    return this.authService.signuplocal(dto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  signinlocal(@Body() dto: SigninDto): Promise<Tokens> {
    return this.authService.signinlocal(dto);
  }

  @UseGuards(AtGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Body('userId') userId: number) {
    return this.authService.logout(userId);
  }

  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Req() req: IRequest) {
    const user = req.user;
    console.log('user', user);
    return this.authService.refreshTokens(+user.sub, user.refreshToken);
  }
}
