import { CreateUserDto, GetUserTokenDto } from "../../schemas/dto/user.dto";
import UserService from "../../services/user.service";
import { WinstonLogger } from "../../utils/logger";

const queries = {
    getUserToken: async (parent: any, args: GetUserTokenDto, context: any) => {
        const logger = new WinstonLogger();
        const userService = new UserService(logger);
        const res = await userService.getUserToken(args);
        return res;
    },
    getUserProfile: async (parent: any, args: any, context: any) => {
        const logger = new WinstonLogger();
        const userService = new UserService(logger);
        const userId = context.user.userId;

        const res = await userService.getUserProfile(userId);
        return res;
    }
};

const mutations = {
    createUser: async (parent: any, args: CreateUserDto, context: any) => {
        const logger = new WinstonLogger();

        const userService = new UserService(logger);
        const res = await userService.createUser(args);
        return res;
    }
};

export const resolvers = { queries, mutations };