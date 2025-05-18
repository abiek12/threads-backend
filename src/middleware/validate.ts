import { ZodSchema } from 'zod';
import { NextFunction, Request, Response } from 'express';

export const validate =
    (schema: ZodSchema<any>, source: 'body' | 'query' | 'params' = 'body') =>
        (req: Request, res: Response, next: NextFunction) => {
            const result = schema.safeParse(req[source]);
            if (!result.success) {
                return res.status(400).json({
                    message: 'Validation error',
                    errors: result.error.flatten(),
                });
            }

            // Replace with parsed data to ensure type-safety
            req[source] = result.data;
            next();
        };