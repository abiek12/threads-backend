interface createUserPayload {
    firstName: string,
    lastName?: string,
    email: string,
    password: string
}

class UserService {
    public static createUser(payload: createUserPayload) {

    }
}

export default UserService;