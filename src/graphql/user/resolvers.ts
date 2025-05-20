import { CreateUserDto } from "../../schemas/dto/user.dto";
import UserService from "../../services/user.service";
import { WinstonLogger } from "../../utils/logger";

const queries = {};

const mutations = {
    createUser: async (_: any, payload: CreateUserDto) => {
        const logger = new WinstonLogger();

        const userService = new UserService(logger);
        const res = await userService.createUser(payload);
        return res.id;
    }
};

export const resolvers = { queries, mutations };