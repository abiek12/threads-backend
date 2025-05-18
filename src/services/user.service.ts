import { createUserPayload } from "../schemas/interfaces/user.interface";
import { createHmac, randomBytes } from "node:crypto";
import { prisma } from "../lib/db";
import { ILogger } from "../utils/logger";
class UserService {
    constructor(private logger: ILogger) { }

    public async createUser(payload: createUserPayload) {
        try {
            const { firstName, lastName, email, password } = payload;
            const existingUser = await this.getUserByEmail(email);

            if (existingUser) {
                this.logger.warn("User already exist with the email!");
                throw new Error('User already exist!');
            }

            const salt = randomBytes(32).toString('hex');
            const hashedPassword = createHmac('sha256', salt).update(password).digest('hex');
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
}

export default UserService;