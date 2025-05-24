import { prisma } from "../lib/db";
import { ILogger } from "../utils/logger";
import { CreateUserDto, GetUserTokenDto } from "../schemas/dto/user.dto";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jsonwebtoken from "jsonwebtoken";
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

    public async createUser(payload: CreateUserDto) {
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


    public async getUserToken(payload: GetUserTokenDto) {
        try {
            const { email, password } = payload;
            const user = await this.getUserByEmail(email);
            if (!user) {
                this.logger.warn("User not found!");
                throw new Error('User not found');
            }

            const isPasswordValid = await this.comparePassword(password, user.password);
            if (!isPasswordValid) {
                this.logger.warn("Invalid password!");
                throw new Error('Invalid password');
            }

            const { accessToken, refreshToken } = await this.createTokens(user.id, user.role);
            return {
                userId: user.id,
                email: user.email,
                accessToken,
                refreshToken
            }

        } catch (error) {
            this.logger.error("Error while getting user token!", error);
            throw error;
        }
    }

    public getUserProfile = async (userId: string) => {
        try {
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
}

export default UserService;