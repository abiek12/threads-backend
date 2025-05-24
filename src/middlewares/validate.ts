import { ZodSchema } from 'zod';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

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

export const decodeToken = (token: string) => {
    try {
        if (!token || token === '') {
            return null;
        }

        const bearerToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
        const jwtSecret = process.env.JWT_SECRET || 'default';

        const decodeToken = jwt.verify(bearerToken, jwtSecret);
        return decodeToken;
    } catch (error) {
        console.error("Error while decoding token!", error);
        throw new Error('Invalid token');
    }
}   