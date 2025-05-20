import { createHmac, randomBytes } from "node:crypto";
import { prisma } from "../lib/db";
import { ILogger } from "../utils/logger";
import { CreateUserDto, GetUserTokenDto } from "../schemas/dto/user.dto";
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

    private generateHash(password: string, salt: string) {
        try {
            return createHmac('sha256', salt).update(password).digest('hex');
        } catch (error) {
            this.logger.error("Error while generating hash!", error);
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

            const salt = randomBytes(32).toString('hex');
            const hashedPassword = this.generateHash(password, salt);

            const user = await prisma.user.create({
                data: {
                    email: email,
                    firstName: firstName,
                    lastName: lastName ?? '',
                    salt: salt,
                    password: hashedPassword
                }
            })

            this.logger.info(`Successfully created user with ID: ${user.id}`);
            return user;
        } catch (error) {
            this.logger.error("Error while creating user!", error);
            throw error;
        }
    }


    private async getUserToken(payload: GetUserTokenDto) {
        try {
            const { email, password } = payload;
            const user = await this.getUserByEmail(email);
            if (!user) {
                this.logger.warn("User not found!");
                throw new Error('User not found');
            }

            const userSalt = user.salt;
            const hashedPassword = this.generateHash(password, userSalt);

        } catch (error) {
            this.logger.error("Error while getting user token!", error);
            throw error;
        }
    }
}

export default UserService;