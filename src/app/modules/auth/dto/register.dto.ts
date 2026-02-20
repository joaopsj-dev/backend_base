import { ApiProperty } from '@nestjs/swagger';
import {
  zEmail,
  zName,
  zPassword,
  zRole,
} from 'src/app/common/validation/validate-fields';
import z from 'zod';

export class RegisterSwaggerDto {
  @ApiProperty({
    description: 'Papel do usuário no sistema',
    enum: ['admin', 'agent', 'client'],
    example: 'client',
  })
  role: 'admin' | 'agent' | 'client';

  @ApiProperty({
    description: 'Nome completo do usuário',
    minLength: 2,
    example: 'João Silva',
  })
  name: string;

  @ApiProperty({
    description: 'Email do usuário',
    format: 'email',
    example: 'joao@exemplo.com',
  })
  email: string;

  @ApiProperty({
    description: 'Senha do usuário (mínimo 6 caracteres)',
    minLength: 6,
    example: 'senha123',
  })
  password: string;
}

export const registerSchema = z
  .object({
    role: zRole,
    name: zName,
    email: zEmail,
    password: zPassword,
  })
  .strict();

export type RegisterDto = z.infer<typeof registerSchema>;
