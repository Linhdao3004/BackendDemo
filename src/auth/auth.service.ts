import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import { RefreshToken } from 'src/refresh_token/entities/refresh_token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRefreshTokenDto } from 'src/refresh_token/dto/create-refresh_token.dto';
import { randomUUID } from 'crypto';
import { RefreshTokenService } from 'src/refresh_token/refresh_token.service';
import { Auth } from './entities/auth.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateAuthDto } from './dto/create-auth.dto';
import { User } from 'src/users/entities/user.entity';
import {
  ensureExists,
  confirmationCodeForgotPass,
} from 'src/middleware/middleware';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailerService,
    private readonly refreshService: RefreshTokenService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async createToken(user: any) {
    // AI bổ sung
    const payload = { sub: user.idUser, username: user.username, role: user.role };
    // AI bổ sung

    // payload signature and then create token
    const token = {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '1d' }),
    };
    return token;
  }

  async logout(refreshToken: any) {
    const refresh_token = await this.refreshTokenRepository.findOneBy({
      token: refreshToken,
    });
    // refresh_token?.isRevoked = 'true';
    // console.log(refresh_token);
    if (!refresh_token) {
      throw new NotFoundException('Refresh token not found');
    }
    await this.refreshTokenRepository.update(refresh_token.refreshId, {
      isRevoked: true,
      updatedAt: new Date(),
    });
    return refresh_token;
  }

  async login(user: any): Promise<any> {
    const token = await this.createToken(user);
    const createReFreshToken = await this.refreshService.create(
      token.refresh_token,
    );

    return createReFreshToken;
  }

  async login_refresh(expiresAccess: any, refresh_token: any) {
    try {
      const date = new Date();
      const expA = expiresAccess;

      // console.log(refresh_token);

      //so sanh hạn token và giờ hiện tại
      if (expA < date) {

        const refresh = await this.refreshTokenRepository.findOneBy({
          token: refresh_token,
        });
        if (!refresh) {
          throw new NotFoundException('Not found refresh');
        }

        // const payload_re = this.jwtService.verify(refresh?.token);
        const payload_re = this.jwtService.verify(refresh_token);
        console.log(payload_re);

        const expRe = new Date(payload_re.exp * 1000);

        // console.log(expRe);//YYMMDDHHmmss
        //refresh token expired
        if (expRe < date) {
          // await this.refreshTokenRepository.update(refresh.refreshId, {
          //   isRevoked: true,
          // });
          throw new BadRequestException('Refresh token expired');
        }
        // check con hang va refresh token con hieu luc

        // if (expRe > date && refresh.isRevoked === false) {
        if (expRe > date) {
          // update refresh Revoke khi refresh access token het han
          // this.refreshTokenRepository.update(refresh.refreshId, {
          //   isRevoked: true,
          // });

          // remove refresh token cũ để tạo refresh và access token mới
          await this.refreshTokenRepository.delete({
            token: refresh_token,
          });

          const user = {
            idUser: payload_re.sub,
            username: payload_re.username,
            // AI bổ sung
            role: payload_re.role,
            // AI bổ sung

          };
          const newToken = await this.createToken(user);
          await this.refreshService.create(newToken.refresh_token);
          return newToken;
        }

        // if (refresh?.isRevoked) {
        //   console.log('token Re vô hiệu hóa');
        // }
      } else return false;
      //so sanh hạn token và giờ hiện tại
    } catch (error) {
      console.log(error);
    }
  }

  async sendConfirmCodePassword(authDto: CreateAuthDto): Promise<any> {
    const user = await this.userRepository.findOneBy({
      username: authDto.username,
    });
    const confirmCode = confirmationCodeForgotPass();
    const confirmCodeExpires = new Date();
    confirmCodeExpires.setMinutes(confirmCodeExpires.getMinutes() + 5);
    if (!user) {
      throw new NotFoundException('Not found username. Enter please!');
    }
    user.confirmCodePass = confirmCode;
    user.confirmCodePassExpires = confirmCodeExpires;
    this.userRepository.save(user);
    this.sendMail(confirmCode, user.email, user.lastName);
  }

  async resetPasswordWithCode(authDto: CreateAuthDto) {
    const user = await this.userRepository.findOneBy({
      confirmCodePass: authDto.confirmationCode,
    });
    // console.log(user);
    // do tìm user bằng mã xác thực gửi bên mail nên để lỗi nhập sai mã xác thực.
    if (!user) {
      throw new BadRequestException(
        'Confirm code invalid. Enter again please!',
      );
    }
    console.log('old: ' + user?.password);

    const getConfirmCode = user?.confirmCodePass;
    const date = new Date();
    const getExpiresCode = user?.confirmCodePassExpires;
    // console.log(getConfirmCode);
    const isEqualPassword = bcrypt.compareSync(
      authDto.newPassword,
      user.password,
    );

    if (authDto.confirmationCode === getConfirmCode && getExpiresCode > date) {
      if (isEqualPassword === true) {
        throw new BadRequestException(
          'Recently used password. Enter a different password!',
        );
      }
      if (authDto.newPassword !== authDto.newPasswordconfirmation) {
        throw new BadRequestException(
          'Password and confirm password do not match. Enter again please!',
        );
      } else {
        const newPassHash = bcrypt.hashSync(authDto.newPassword, 10);
        user.password = newPassHash;
        this.userRepository.save(user);
        console.log('new: ' + user.password);
        return { messege: 'Update password success' };
      }
    }
    // if (authDto.confirmationCode !== getConfirmCode) {
    //   return { messege: 'Confirm code invalid. Enter again please!' };
    // }
    if (getExpiresCode < date) {
      return { messege: 'Confirm code expired. Send confirm code please!' };
    }
  }

  sendMail(codePass: any, email: any, nameUser: any) {
    this.mailService.sendMail({
      from: 'Sản Phẩm xanh <daolinh031222@gmail.com>',
      to: email,
      subject: 'Đổi pass',
      html: this.mailCodePassContent(codePass, nameUser),
    });
  }

  mailCodePassContent(codePass: any, nameUser: any) {
    const html = `
     <h2 style="
    font-weight: 600;">Thêm một bước nữa để đổi mật khẩu của bạn</h2>
    <p>Xin chào ${nameUser},</p>
    <p>Chúng tôi đã nhận được yêu cầu đổi mật khẩu của bạn. Hãy nhập mã này vào SanPhamXanh:</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <div style="
          font-weight: 600;
          border: 3px solid blue;
          width: 200px;
          padding: 10px 0;
          border-radius: 10px;
          background-color: #64EAEA;
          text-align: center;
          letter-spacing: 5px;
          font-size: 20px;">
          ${codePass}
        </div>
      </td>
    </tr>
    </table>

    <p style="
      text-align: center;
      opacity: 0.6;
      font-size: 14px;
      letter-spacing: 0.8px;">Không chia sẻ mã này với bất kỳ ai</p>

    <h3 style="margin: 5px 0;">Nếu có người yêu cầu mã này</h3>
    <p style="margin: 0;">Đừng chia sẻ mã này với bất cứ ai, đặc biệt với người nói là họ làm việc cho SanPhamXanh.<br>Họ có thể đang cố hack tài khoản của bạn.</p>

    <p>Trân trọng cảm ơn!<br>Đội ngũ bảo mật của SanPhamXanh</p>
    `;
    return html;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const secounds = ('0' + date.getSeconds()).slice(-2);
    return `${year}${month}${day}${hours}${minutes}${secounds}`;
  }

  checkTokenDateOfUser(token: string) {
    try {
      const secretCode = this.configService.get<string>('JWT_SECRET');
      const checkToken = this.jwtService.verify(token, {
        secret: secretCode,
      });
      return {
        expired: false,
        checkToken,
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return { expired: true, message: 'Token has expired' };
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}
