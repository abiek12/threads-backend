import { CreateUserDto, GetUserTokenDto } from "../../schemas/dto/user.dto";
import UserService from "../../services/user.service";
import { WinstonLogger } from "../../utils/logger";

const queries = {
    getUserToken: async (_: any, payload: GetUserTokenDto) => {
        const logger = new WinstonLogger();
        const userService = new UserService(logger);
        const res = await userService.getUserToken(payload);
        return res;
    },
    getUserProfile: async (_: any, params: any, context: any) => {
        const logger = new WinstonLogger();
        const userService = new UserService(logger);
        const userId = context.user.userId;

        const res = await userService.getUserProfile(userId);
        return res;
    }
};

const mutations = {
    createUser: async (_: any, payload: CreateUserDto) => {
        const logger = new WinstonLogger();

        const userService = new UserService(logger);
        const res = await userService.createUser(payload);
        return res;
    }
};

export const resolvers = { queries, mutations };