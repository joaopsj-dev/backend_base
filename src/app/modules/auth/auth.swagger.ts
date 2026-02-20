import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { LoginSwaggerDto } from './dto/login.dto';
import { RegisterSwaggerDto } from './dto/register.dto';

const successResponseSchema = {
  type: 'object',
  properties: { success: { type: 'boolean', example: true } },
};

export function ApiMe() {
  return applyDecorators(
    ApiOperation({
      summary: 'Usuário autenticado',
      description:
        'Retorna os dados do usuário autenticado. Requer o cookie access_token.',
    }),
    ApiResponse({
      status: 200,
      description: 'Dados do usuário autenticado',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          role: { type: 'string', enum: ['admin', 'agent', 'client'] },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Não autenticado (token ausente ou inválido)',
    }),
    ApiResponse({
      status: 404,
      description: 'Usuário não encontrado',
    }),
  );
}

export function ApiLogin() {
  return applyDecorators(
    ApiOperation({
      summary: 'Login',
      description:
        'Autentica o usuário. Em caso de sucesso, os tokens JWT são definidos como cookies httpOnly (access_token e refresh_token).',
    }),
    ApiBody({ type: LoginSwaggerDto }),
    ApiResponse({
      status: 200,
      description: 'Login realizado com sucesso. Tokens definidos nos cookies.',
      schema: successResponseSchema,
    }),
    ApiResponse({
      status: 400,
      description: 'Dados inválidos (campos ausentes, formato incorreto, etc.)',
    }),
    ApiResponse({
      status: 401,
      description: 'Email ou senha inválidos',
    }),
  );
}

export function ApiRegister() {
  return applyDecorators(
    ApiOperation({
      summary: 'Registrar novo usuário',
      description:
        'Cria uma nova conta de usuário. Em caso de sucesso, os tokens JWT são definidos como cookies httpOnly (access_token e refresh_token).',
    }),
    ApiBody({ type: RegisterSwaggerDto }),
    ApiResponse({
      status: 201,
      description: 'Usuário registrado com sucesso. Tokens definidos nos cookies.',
      schema: successResponseSchema,
    }),
    ApiResponse({
      status: 400,
      description: 'Dados inválidos (campos ausentes, formato incorreto, etc.)',
    }),
    ApiResponse({
      status: 409,
      description: 'Email já cadastrado no sistema',
    }),
  );
}

export function ApiRefresh() {
  return applyDecorators(
    ApiOperation({
      summary: 'Renovar tokens',
      description:
        'Gera novos access_token e refresh_token a partir do refresh_token enviado como cookie. Requer o cookie refresh_token.',
    }),
    ApiResponse({
      status: 200,
      description: 'Tokens renovados com sucesso. Novos cookies definidos.',
      schema: successResponseSchema,
    }),
    ApiResponse({
      status: 401,
      description: 'Refresh token ausente ou inválido',
    }),
  );
}

export function ApiLogout() {
  return applyDecorators(
    ApiOperation({
      summary: 'Logout',
      description:
        'Encerra a sessão do usuário removendo os cookies access_token e refresh_token.',
    }),
    ApiResponse({
      status: 200,
      description: 'Logout realizado com sucesso',
      schema: {
        type: 'object',
        properties: { message: { type: 'string', example: 'Logout realizado' } },
      },
    }),
  );
}
