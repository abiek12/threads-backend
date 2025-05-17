import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';

async function init() {
    const app = express();
    const PORT = process.env.PORT || 3000;

    // Middleware
    app.use(express.json());
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
                hello: String
            }`,
        resolvers: {
            Query: {
                hello: () => 'Hey there! Iam your GraphQL server.',
            },
        },
    })

    // Start the gql server
    await gqlServer.start();

    app.get('/', (req, res) => {
        res.send('Express server is running!');
    });

    app.use('/graphql', expressMiddleware(gqlServer) as express.Express);
    app.listen(PORT, () => {
        console.log(`Server is running on ${PORT}`);
    });
}

init().catch((err) => {
    console.error('Error starting server:', err);
});