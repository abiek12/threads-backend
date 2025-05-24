import express from 'express';
import cors from 'cors';
import { expressMiddleware } from '@as-integrations/express5';
import { ILogger, WinstonLogger } from './utils/logger';
import createApolloGraphqlServer from './graphql';
import { decodeToken } from './middlewares/validate';
import { createAdminUser } from './utils/common';

async function init() {
    const app = express();
    const logger: ILogger = new WinstonLogger();
    const PORT = process.env.PORT || 3000;

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    // CORS configuration
    const corsOptions = {
        origin: '*', // Allow all origins
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: false,
    };
    app.use(cors(corsOptions));

    // creating graphql server
    const gqlServer = await createApolloGraphqlServer();
    app.use('/graphql', cors(corsOptions), express.json(), expressMiddleware(gqlServer, {
        context: async ({ req }) => {
            // You can add any context you want to pass to your resolvers here
            const token = req.headers.authorization || '';
            try {
                const user = decodeToken(token);
                return { user };
            } catch (error) {
                logger.error("Error while getting token!", error);
                return { user: null };
            }
        }
    }) as express.Express);

    // Admin user creation
    await createAdminUser()

    // Health check endpoint
    app.get('/', (req, res) => {
        res.send('Express server is running!');
    });

    app.listen(PORT, () => {
        logger.info(`Server is running on ${PORT}`);
    });
}

init().catch((err) => {
    console.error('Error starting server:', err);
});