import { NotFoundException } from '@nestjs/common';
import { Request } from 'express';

export const cookieExtractor = (req: Request): string | null => {
  if (req && req.cookies) {
    return req.cookies['access_token'] || null;
  }
  return null;
};

export const confirmationCodeForgotPass = () => {
  return Math.floor(Math.random() * 1000000);
};

export const ensureExists = (entityName: string, entity: any) => {
  if (!entity) throw new NotFoundException(`${entityName} not found`);
};
