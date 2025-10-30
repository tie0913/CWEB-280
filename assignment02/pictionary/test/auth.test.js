const {signIn, signOut, signUp, deleteAccount} = require('./actions/auth.action')
const {params} = require('./parameters')

let pictionary_cookie


describe('POST /auth/signIn', () => {
    it.only('should sign in successfully and get cookie', async () => {
        const {cookies, body} = await signIn(params.admin_email, params.admin_pwd)
        expect(body).toHaveProperty('code', 0)
        expect(Array.isArray(cookies)).toBe(true)
        expect(cookies[0]).toMatch(/pictionary_user/)
        pictionary_cookie = cookies[0]
    })
})

describe('POST /auth/signOut', () => {
    it.only('should sign out successfully and the cookie disappears', async() => {
        const body = await signOut(pictionary_cookie)
        expect(body).toHaveProperty('code', 0)
    })
})



describe('POST /auth/signUp', ()=> {
    it.only('should create a new user', async() => {
        const body = await signUp(params.regular_user_name, params.regular_user_pwd, params.regular_user_email)
        expect(body).toHaveProperty('code', 0)
    })
})

describe('POST /auth/signIn', () => {
    it.only('should sign in successfully and get cookie', async () => {
        const {cookies, body} = await signIn(params.regular_user_email, params.regular_user_pwd)
        expect(body).toHaveProperty('code', 0)
        expect(Array.isArray(cookies)).toBe(true)
        expect(cookies[0]).toMatch(/pictionary_user/)
        pictionary_cookie = cookies[0]
    })
})

describe('POST /auth/deleteAccount', () => {
    it.only('should delete current account and sign out', async () => {
        const body = await deleteAccount(pictionary_cookie)
        expect(body).toHaveProperty('code', 0)
    })
})