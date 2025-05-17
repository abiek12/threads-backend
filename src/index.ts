import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';

async function init() {
    const app = express();
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

    // Create graphql server
    const gqlServer = new ApolloServer({
        typeDefs: `
            type Query {
                hello: String,
                say(name: String!): String
            }`,
        resolvers: {
            Query: {
                hello: () => 'Hey there! Iam your GraphQL server.',
                say: (_: any, { name }: { name: string }) => `Hello ${name}!, How are you?`,
            },
        },
    })

    // Start the gql server
    await gqlServer.start();

    app.use('/graphql', cors(corsOptions), express.json(), expressMiddleware(gqlServer) as express.Express);

    // Health check endpoint
    app.get('/', (req, res) => {
        res.send('Express server is running!');
    });

    app.listen(PORT, () => {
        console.log(`Server is running on ${PORT}`);
    });
}

init().catch((err) => {
    console.error('Error starting server:', err);
});