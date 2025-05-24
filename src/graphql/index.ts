import { ApolloServer } from "@apollo/server";
import { User } from './user';

const createApolloGraphqlServer = async () => {
    try {
        // Create graphql server
        const gqlServer = new ApolloServer({
            typeDefs: `
            ${User.typeDefs}
            type Query {
                hello: String,
                ${User.queries}
            }
            type Mutation {
                say(name: String!): String,
                ${User.mutations}
            }
                `,
            resolvers: {
                Query: {
                    hello: () => 'Hey there! Iam your GraphQL server.',
                    ...User.resolvers.queries
                },
                Mutation: {
                    say: (_: any, { name }: { name: string }) => `Hello ${name}!, How are you?`,
                    ...User.resolvers.mutations
                }
            },
        })

        // Start the gql server
        await gqlServer.start();
        return gqlServer;
    } catch (error) {
        console.log("Error while creating graphql server!")
        throw error;
    }
}

export default createApolloGraphqlServer;