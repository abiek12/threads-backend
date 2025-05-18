import { Logger } from "winston";

interface createUserPayload {
    firstName: string,
    lastName?: string,
    email: string,
    password: string
}

class UserService {
    constructor(private logger: Logger) { }

    public createUser(payload: createUserPayload) {
        try {

        } catch (error) {
            this.logger.error("Error while creating user!", error);
            throw error;
        }
    }
}

export default UserService;