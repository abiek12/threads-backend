import { prisma } from "../lib/db";
import { ILogger } from "../utils/logger";
import { CreateUserDto, GetUserTokenDto } from "../schemas/dto/user.dto";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jsonwebtoken from "jsonwebtoken";
import Redis from "ioredis";
dotenv.config();

class UserService {
    constructor(private logger: ILogger) { }
    private async getUserByEmail(email: string) {
        try {
            return prisma.user.findUnique({
                where: { email }
            })
        } catch (error) {
            this.logger.error("Error while getting user by email!", error);
            throw error;
        }
    }

    private async generateHash(password: string) {
        try {
            const saltRounds = parseInt(process.env.SALT_ROUNDS || '10');
            return await bcrypt.hash(password, saltRounds);
        } catch (error) {
            this.logger.error("Error while generating hash!", error);
            throw error;
        }
    }

    private async comparePassword(password: string, hashedPassword: string) {
        try {
            return await bcrypt.compare(password, hashedPassword);
        } catch (error) {
            this.logger.error("Error while comparing password!", error);
            throw error;
        }
    }

    private async createTokens(userId: string, role: string = 'user') {
        try {
            const secretKey = process.env.JWT_SECRET || 'default';

            const accessToken = jsonwebtoken.sign({ userId, role }, secretKey, {
                expiresIn: '1h' // Access token valid for 1 hour
            });

            const refreshToken = jsonwebtoken.sign({ userId, role }, secretKey, {
                expiresIn: '7d' // Refresh token valid for 7 days
            });

            this.logger.info(`Successfully created tokens for user with ID: ${userId}`);
            return { accessToken, refreshToken };
        } catch (error) {
            this.logger.error("Error while creating token!", error);
            throw error;
        }
    }

    private async getUserById(userId: string) {
        try {
            return await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                    profileImageUrl: true,
                    createdAt: true,
                    updatedAt: true
                }
            })
        } catch (error) {
            this.logger.error("Error while fetching user by id!", error);
            throw error;
        }
    }

    public async createUser(payload: CreateUserDto, context: any) {
        try {
            const { firstName, lastName, email, password } = payload;
            const existingUser = await this.getUserByEmail(email);

            if (existingUser) {
                this.logger.warn("User already exist with the email!");
                throw new Error('User already exist');
            }

            const hashedPassword = await this.generateHash(password);
            const user = await prisma.user.create({
                data: {
                    email: email,
                    firstName: firstName,
                    lastName: lastName ?? '',
                    password: hashedPassword
                }
            })

            this.logger.info(`Successfully created user with ID: ${user.id}`);
            return user.id;
        } catch (error) {
            this.logger.error("Error while creating user!", error);
            throw error;
        }
    }

    public async getUserToken(payload: GetUserTokenDto, context: any) {
        const { email, password, role } = payload;
        const redis: Redis = context.redis;
        try {
            const user = await this.getUserByEmail(email);
            if (!user) {
                this.logger.warn("User not found!");
                throw new Error('User not found');
            }

            // Check if the user is already in redis
            const cachedUser = await redis.get(`user:${user.id}`);
            if (cachedUser) {
                this.logger.info("User found in cache, returning cached data.");
                return JSON.parse(cachedUser);
            }

            const isPasswordValid = await this.comparePassword(password, user.password);
            if (!isPasswordValid) {
                this.logger.warn("Invalid password!");
                throw new Error('Invalid password');
            }

            const { accessToken, refreshToken } = await this.createTokens(user.id, user.role);
            const res = {
                userId: user.id,
                email: user.email,
                accessToken,
                refreshToken
            }
            // save to redis with 1 hour expiration
            redis.set(`user:${user.id}`, JSON.stringify(res), 'EX', 3600, 'NX');
            return res;
        } catch (error) {
            this.logger.error("Error while getting user token!", error);
            throw error;
        }
    }

    public getUserProfile = async (args: any, context: any) => {
        try {
            const userId = context.user?.userId;
            if (!userId) {
                this.logger.warn("User is not authenticated!");
                throw new Error('User is not authenticated');
            }
            const user = await this.getUserById(userId);
            if (!user) {
                this.logger.warn("User not found!");
                throw new Error('User not found');
            }

            return user;
        } catch (error) {
            this.logger.error("Error while getting user profile!", error);
            throw error;
        }
    }

    public getAllUsers = async (args: any, context: any) => {
        try {
            const { size = 10, page = 1 } = args;

            const userId = context.user?.userId;
            if (!userId) {
                this.logger.warn("User is not authenticated!");
                throw new Error('User is not authenticated');
            }
            if (!context.user?.role || context.user.role !== 'ADMIN') {
                this.logger.warn("User is not authorized to view all users!");
                throw new Error('User is not authorized to view all users');
            }

            const users = await prisma.user.findMany({
                skip: (page - 1) * size,
                take: size,
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                    profileImageUrl: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            return users;
        } catch (error) {
            this.logger.error("Error while getting all users!", error);
            throw error;
        }
    }

    public getUser = async (id: string, context: any) => {
        try {
            const userId = context.user?.userId;
            if (!userId) {
                this.logger.warn("User is not authenticated!");
                throw new Error('User is not authenticated');
            }
            if (!context.user?.role || context.user.role !== 'ADMIN') {
                this.logger.warn("User is not authorized to create a new user!");
                throw new Error('User is not authorized to create a new user');
            }

            const user = await this.getUserById(id);
            if (!user) {
                this.logger.warn("User not found!");
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            this.logger.error("Error while getting user by id!", error);
            throw error;
        }
    }
}

export default UserService;