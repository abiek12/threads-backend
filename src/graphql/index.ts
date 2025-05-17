import { ApolloServer } from "@apollo/server";

const createApolloGraphqlServer = async () => {
    try {
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
        return gqlServer;
    } catch (error) {
        console.log("Error while creating graphql server!")
        throw error;
    }
}

export default createApolloGraphqlServer;