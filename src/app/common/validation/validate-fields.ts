import z from 'zod';
import { requiredString } from './required-fields';

export const zName = z.string(requiredString()).min(2, 'Minimo 2 caracteres');

export const zEmail = z.email('Email Inválido');

export const zPassword = z
  .string(requiredString())
  .min(6, 'Minimo 6 caracteres');

export const zRole = z
  .enum(['admin', 'agent', 'client'], 'Tipo invalido para o campo role')
  .superRefine((val, ctx) => {
    if (val === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Campo obrigatório',
      });
    }
  });
