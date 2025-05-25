import { CreateUserDto, GetUserTokenDto } from "../../schemas/dto/user.dto";
import UserService from "../../services/user.service";
import { WinstonLogger } from "../../utils/logger";

const queries = {
    getUserToken: async (parent: any, args: GetUserTokenDto, context: any) => {
        const logger = new WinstonLogger();
        const userService = new UserService(logger);
        const res = await userService.getUserToken(args, context);
        return res;
    },
    getUserProfile: async (parent: any, args: any, context: any) => {
        const logger = new WinstonLogger();
        const userService = new UserService(logger);

        const res = await userService.getUserProfile(args, context);
        return res;
    },
    getAllUsers: async (parent: any, args: any, context: any) => {
        const logger = new WinstonLogger();
        const userService = new UserService(logger);

        const userId = context.user?.userId;
        if (!userId) {
            logger.warn("User is not authenticated!");
            throw new Error('User is not authenticated');
        }
        if (!context.user?.role || context.user.role !== 'ADMIN') {
            logger.warn("User is not authorized to view all users!");
            throw new Error('User is not authorized to view all users');
        }

        const res = await userService.getAllUsers(args, context);
        return res;
    },
    getUser: async (parent: any, args: { id: string }, context: any) => {
        const logger = new WinstonLogger();
        const userService = new UserService(logger);

        const res = await userService.getUser(args.id, context);
        return res;
    }
};

const mutations = {
    createUser: async (parent: any, args: CreateUserDto, context: any) => {
        const logger = new WinstonLogger();

        const userService = new UserService(logger);
        const res = await userService.createUser(args, context);
        return res;
    }
};

export const resolvers = { queries, mutations };