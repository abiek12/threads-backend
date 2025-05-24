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
            const salt = process.env.SALT || 'qwerty@1qaz';
            return await bcrypt.hash(password, salt);
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
            const expiresIn = process.env.JWT_EXPIRES_IN || '1h';

            const accessToken = jsonwebtoken.sign({ userId, role }, secretKey, {
                expiresIn: parseInt(expiresIn)
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
}

export default UserService;