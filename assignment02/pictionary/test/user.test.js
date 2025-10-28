const {self, list} = require('./actions/user.action')
const {signIn, signUp, signOut,deleteAccount} = require('./actions/auth.action')
const {params} = require('./parameters')
let pictionary_cookie
/**
 * Regular user sign up, in, look up self information and delete account
 */
describe('POST /auth/signUp', ()=> {
    it('should create a new user', async() => {
        const body = await signUp(params.regular_user_name, params.regular_user_pwd, params.regular_user_email)
        expect(body).toHaveProperty('code', 0)
    })
})

describe('POST /auth/signIn', () => {
    it('should sign in successfully and get cookie', async () => {
        const {cookies, body} = await signIn(params.regular_user_email, params.regular_user_pwd)
        expect(body).toHaveProperty('code', 0)
        expect(Array.isArray(cookies)).toBe(true)
        expect(cookies[0]).toMatch(/pictionary_user/)
        pictionary_cookie = cookies[0]
    })
})

describe('GET /users/self', () => {
    it('should get current users infomation', async ()=> {
        const body = await self(pictionary_cookie)
        expect(body).toHaveProperty('code', 0)
        expect(body).toHaveProperty('body')
        expect(body.body).toHaveProperty('name', params.regular_user_name)
    })
})

describe('POST /auth/deleteAccount', () => {
    it('should delete current account and sign out', async () => {
        const body = await deleteAccount(pictionary_cookie)
        expect(body).toHaveProperty('code', 0)
    })
})

/**
 * admin sign in , list all the users and sign out
 */
describe('POST /auth/signIn', () => {
    it('should sign in successfully and get cookie', async () => {
        const {cookies, body} = await signIn(params.admin_email, params.admin_pwd)
        expect(body).toHaveProperty('code', 0)
        expect(Array.isArray(cookies)).toBe(true)
        expect(cookies[0]).toMatch(/pictionary_user/)
        pictionary_cookie = cookies[0]
    })
})

describe('GET /users/list', () => {
    it('should list first page of all users', async () => {
        const {body} = await list(pictionary_cookie)
        expect(body).toHaveProperty('list')
        expect(Array.isArray(body.list)).toBe(true)
        expect(body).toHaveProperty('page')
        expect(body.page).toHaveProperty('no', 1)
        expect(body.page).toHaveProperty('size', 20)
    })
})

describe('POST /auth/signOut', () => {
    it('should sign out successfully and the cookie disappears', async() => {
        const body = await signOut(pictionary_cookie)
        expect(body).toHaveProperty('code', 0)
    })
})