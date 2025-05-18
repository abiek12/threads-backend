import { Logger } from "winston";
import { createUserPayload } from "../schemas/interfaces/user.interface";

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