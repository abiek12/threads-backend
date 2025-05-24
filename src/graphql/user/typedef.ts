export const typeDefs = `#graphql
    type UserTokenResponse {
        userId: ID!
        email: String!
        accessToken: String!
        refreshToken: String!
    }
`