export const queries = `#graphql
    getUserToken(email: String!, password: String!): UserTokenResponse!
    getUserProfile(userId: String!): UserProfileResponse!
`