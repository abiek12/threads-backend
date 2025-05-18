import { createUserPayload } from "../../schemas/interfaces/user.interface";
import UserService from "../../services/user.service";
import { WinstonLogger } from "../../utils/logger";

const queries = {};

const mutations = {
    createUser: async (_: any, payload: createUserPayload) => {
        const logger = new WinstonLogger();

        const userService = new UserService(logger);
        const res = await userService.createUser(payload);
        return res.id;
    }
};

export const resolvers = { queries, mutations };