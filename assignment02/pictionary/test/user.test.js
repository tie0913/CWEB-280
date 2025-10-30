const {self, list, selfUpdate, getUserForAdmin, patch, ban, restore, listBannedUsers} = require('./actions/user.action')
const {signIn, signUp, signOut,deleteAccount} = require('./actions/auth.action')
const {params} = require('./parameters')
let pictionary_cookie




/**
 * Regular user sign up, in, look up self information and delete account
 */
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

describe('GET /users/self', () => {
    it.only('should get current users infomation', async ()=> {
        const body = await self(pictionary_cookie)
        expect(body).toHaveProperty('code', 0)
        expect(body).toHaveProperty('body')
        expect(body.body).toHaveProperty('name')
    })
})

describe('POST /users/self', () => {

    const tempName = "Yamazaki_" + (Math.ceil(Math.random()) % 100)
    let currentUser
    it.only('should get current users infomation', async ()=> {
        const body = await self(pictionary_cookie)
        currentUser = body.body
    })

    it.only('should update current users name', async () => {
        currentUser.name = tempName
        const updateBody = await selfUpdate(currentUser, pictionary_cookie)
        expect(updateBody).toHaveProperty('code', 0)
    })

    it.only('should get user information with correct name', async() => {
        const selfBody = await self(pictionary_cookie)
        expect(selfBody.body).toHaveProperty('name', tempName)
    })
})

describe('POST /auth/deleteAccount', () => {
    it.only('should delete current account and sign out', async () => {
        const body = await deleteAccount(pictionary_cookie)
        expect(body).toHaveProperty('code', 0)
    })
})

/**
 * admin sign in , list all the users and sign out
 */
describe('POST /auth/signIn', () => {
    it.only('should sign in successfully and get cookie', async () => {
        const {cookies, body} = await signIn(params.admin_email, params.admin_pwd)
        expect(body).toHaveProperty('code', 0)
        expect(Array.isArray(cookies)).toBe(true)
        expect(cookies[0]).toMatch(/pictionary_user/)
        pictionary_cookie = cookies[0]
    })
})

describe('GET /users/list', () => {
    it.only('should list first page of all users', async () => {
        const {body} = await list(pictionary_cookie)
        expect(body).toHaveProperty('list')
        expect(Array.isArray(body.list)).toBe(true)
        expect(body).toHaveProperty('page')
        expect(body.page).toHaveProperty('no', 1)
        expect(body.page).toHaveProperty('size', 20)
    })
})


describe('Test Update user by Admin', () => {

    let admin
    it.only('should quert admin user information', async () => {
        const res = await self(pictionary_cookie)
        admin = res.body
        expect(admin).toHaveProperty('email', 'wangtie_913@outlook.com')
    })

    it.only('should get admin by admin id', async () => {
        const res = await getUserForAdmin(admin._id, pictionary_cookie)
        expect(res.body).toHaveProperty('admin', true)
        admin = res.body
    })

    it.only('should update admin name', async () => {
        admin.name = 'Admin_' + Math.ceil(Math.random()) % 100
        const res = await patch(admin, pictionary_cookie)
        expect(res).toHaveProperty('code', 0)
    })
})


describe('Test ban and restore user', () => {


    /**
     * regist a user which will be banned later
     */
    let banned_user
    it.only('should create a new user', async() => {
        const body = await signUp(params.banned_user_name, params.banned_user_pwd, params.banned_user_email)
        expect(body).toHaveProperty('code', 0)
    })

    /**
     * find the banned user
     */
    it.only('should list first page of all users', async () => {
        const {body} = await listBannedUsers(params.banned_user_name, pictionary_cookie)
        expect(body).toHaveProperty('list')
        expect(Array.isArray(body.list)).toBe(true)
        expect(body).toHaveProperty('page')
        expect(body.page).toHaveProperty('no', 1)
        expect(body.page).toHaveProperty('size', 20)

        banned_user = body.list.filter((u) => {
            return u.email === params.banned_user_email
        })[0]
    })
    
    it.only("ban the user", async () => {
        const res = await ban(banned_user['_id'], pictionary_cookie)
        expect(res).toHaveProperty('code', 0)
    })

    it.only('banned user can not sign in ', async () => {
        const {body} = await signIn(params.banned_user_email, params.banned_user_pwd)
        expect(body).toHaveProperty('code', 3)
    })

    it.only("restore the user", async () => {
        const res = await restore(banned_user['_id'], pictionary_cookie)
        expect(res).toHaveProperty('code', 0)
    })
    
    let banned_user_cookie
    it.only('banned user can sign in ', async () => {
        const {cookies, body} = await signIn(params.banned_user_email, params.banned_user_pwd)
        expect(body).toHaveProperty('code', 0)
        banned_user_cookie = cookies[0]
    })

    it.only('banned user delete account successfully', async() => {
        const body = await deleteAccount(banned_user_cookie)
        expect(body).toHaveProperty('code', 0)
    })

})

describe('POST /auth/signOut', () => {
    it.only('should sign out successfully and the cookie disappears', async() => {
        const body = await signOut(pictionary_cookie)
        expect(body).toHaveProperty('code', 0)
    })
})
