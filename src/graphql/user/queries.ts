export const queries = `#graphql
    getUserToken(email: String!, password: String!): UserTokenResponse!
    getUserProfile: UserProfileResponse!
    getAllUsers(size: Int, page: Int): [UserProfileResponse!]!
    getUser(id: String!): UserProfileResponse!
`