import { Logger } from "winston";
import { createUserPayload } from "../schemas/interfaces/user.interface";
import { createHmac, randomBytes } from "node:crypto";
import { prisma } from "../lib/db";
class UserService {
    constructor(private logger: Logger) { }

    public async createUser(payload: createUserPayload) {
        try {
            const { firstName, lastName, email, password } = payload;
            const salt = randomBytes(32).toString();
            const hashedPassword = createHmac('sha256', salt).update(password).digest('hex');
            return await prisma.user.create({
                data: {
                    email: email,
                    firstName: firstName,
                    lastName: lastName ?? '',
                    salt: salt,
                    password: hashedPassword
                }
            })

        } catch (error) {
            this.logger.error("Error while creating user!", error);
            throw error;
        }
    }
}

export default UserService;