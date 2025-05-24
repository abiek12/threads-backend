export const typeDefs = `#graphql
    type UserTokenResponse {
        user: User!
        accessToken: String!
        refreshToken: String!
    }

    type User {
        id: ID!
        email: String!
    }
`