export const typeDefs = `#graphql
    type UserTokenResponse {
        userId: ID!
        email: String!
        accessToken: String!
        refreshToken: String!
    }

    type UserProfileResponse {
        id: ID!
        firstName: String!
        lastName: String
        email: String!
        role: String!
        profileImageUrl: String
        createdAt: String!
        updatedAt: String!
    }
`