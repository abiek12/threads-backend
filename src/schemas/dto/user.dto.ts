import { z } from 'zod';

export const UserSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(100),
    email: z.string().email(),
    password: z.string().min(6).max(100),
});

export type CreateUserDto = z.infer<typeof UserSchema>;