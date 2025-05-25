import { z } from 'zod';

export const createUserSchema = z.object({
    id: z.string().uuid(),
    firstName: z.string().min(1).max(100),
    lastName: z.string().optional(),
    email: z.string().email(),
    password: z.string().min(6).max(100),
});

export const getUserTokenSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
    role: z.enum(['USER', 'ADMIN']),
})

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type GetUserTokenDto = z.infer<typeof getUserTokenSchema>;