import { ApiProperty } from '@nestjs/swagger';
import { zEmail, zPassword } from 'src/app/common/validation/validate-fields';
import z from 'zod';

export class LoginSwaggerDto {
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

export const loginSchema = z
  .object({
    email: zEmail,
    password: zPassword,
  })
  .strict();

export type LoginDto = z.infer<typeof loginSchema>;
