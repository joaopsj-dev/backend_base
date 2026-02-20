import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";
import { ZodSchema, ZodError } from "zod";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema<any>) {}

  transform(value: any, _metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const zodError: ZodError = result.error;
      const formattedErrors: Record<string, { message: string }> = {};
      for (const issue of zodError.issues) {
        if (issue.path.length > 0) {
          const field = String(issue.path[0]);
          if (!formattedErrors[field]) {
            formattedErrors[field] = { message: issue.message };
          }
        }
      }
      throw new BadRequestException({
        message: "Validation failed",
        errors: formattedErrors,
      });
    }
    return result.data;
  }
}
