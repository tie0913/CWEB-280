
const {signIn, signUp, deleteAccount, signOut} = require('./actions/auth.action')
const {selfUpdate, patch} = require('./actions/user.action')
const Word = require('./actions/word.action');
const {params} = require('./parameters')

const Room = require('./actions/room.action')


describe('Cover most error branches', () => {

    let owner_cookie = ""
    it.only('should get sign in demand', async() => {
        const payload = { name: 'Lobby One', maxPlayers: 4, visibility: 0 };
        const body = await Room.create(owner_cookie, payload);
        expect(body).toHaveProperty('message', 'Token does not exist, please sign in')
    })
    
    it.only('should get sign in fail message', async() => {
        const fakeCookie = "pictionary_user=ODE5fQ.GL_H8QXyeTUoQ34_cbe0H7r-1b5AEJAS6NDxAQb4LWc; Path=/; HttpOnly"
        const payload = { name: 'Lobby One', maxPlayers: 4, visibility: 0 };
        const body = await Room.create(fakeCookie, payload);
        expect(body).toHaveProperty('message', 'resolving token has errors')
    })

    it.only('should get error cookie', async() => {
        const passedCookie = "pictionary_user=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb250ZW50IjoiNjkwM2UwYmI5NDk1MDE4NGIxMjNmYWFjIiwiaWF0IjoxNzYxODYxODE5fQ.GL_H8QXyeTUoQ34_cbe0H7r-1b5AEJAS6NDxAQb4LWc; Path=/; HttpOnly"
        const payload = { name: 'Lobby One', maxPlayers: 4, visibility: 0 };
        const body = await Room.create(passedCookie, payload);
        expect(body).toHaveProperty('message', 'no session has been found by current session id, you need to sign in again')
    })

    it.only('duplicate user registration', async() => {
        const body = await signUp(params.admin_name, params.admin_pwd, params.admin_email)
        expect(body).toHaveProperty('message', 'duplicate email')
    })


    it.only('sign in without parametes', async () => {
        const {body} = await signIn('', '')
        expect(body).toHaveProperty('code', 1)
    })

    it.only('sign up without parametes', async () => {
        const body = await signUp('', '', '')
        expect(body).toHaveProperty('code', 1)
    })

    it.only('should create a new user', async() => {
        const body = await signUp(params.regular_user_name, params.regular_user_pwd, params.regular_user_email)
        expect(body).toHaveProperty('code', 0)
    })

    let regular_cookie 
    it.only('should sign in successfully and get cookie', async () => {
        const {cookies, body} = await signIn(params.regular_user_email, params.regular_user_pwd)
        expect(body).toHaveProperty('code', 0)
        expect(Array.isArray(cookies)).toBe(true)
        expect(cookies[0]).toMatch(/pictionary_user/)
        regular_cookie = cookies[0]
    })

    it.only('create room without parameters', async() => {
        const body = await Room.create(regular_cookie, {})
        expect(body).toHaveProperty('code', 1)
    })

    it.only('list rooms with wrong parameters', async() => {
        const body = await Room.list(regular_cookie, "state=-10")
        expect(body).toHaveProperty('code', 1)
    })


    it.only('update self profile with wrong parameters', async() => {
        const body = await await selfUpdate({},regular_cookie)
        expect(body).toHaveProperty('code', 1)
    })


    it.only('regular user delete account', async() => {
        const body = await deleteAccount(regular_cookie)
        expect(body).toHaveProperty('code', 0)
    })


    let admin_cookie
    it.only('admin should sign in successfully and get cookie', async () => {
        const {cookies, body} = await signIn(params.admin_email, params.admin_pwd)
        expect(body).toHaveProperty('code', 0)
        expect(Array.isArray(cookies)).toBe(true)
        expect(cookies[0]).toMatch(/pictionary_user/)
        admin_cookie = cookies[0]
    })

    it.only('admin update user info without parameters', async() => {
        const body = await patch({}, admin_cookie)
        expect(body).toHaveProperty('code', 1)
    })


    it.only('create word without parameter', async() => {
        const body = await Word.create(admin_cookie, {})
        expect(body).toHaveProperty('code', 1)
    })

    it.only('update word without parameter', async() => {
        const body = await Word.update(admin_cookie, '', {})
        expect(body).toHaveProperty('code', 1)
    })

    it.only('list words with wrong parameter', async() => {
        const body = await Word.list(admin_cookie, "difficulty=123")
        expect(body).toHaveProperty('code', 1)
    })

    it.only('ramdon by difficulty with wrong parameter', async() => {
        const body = await Word.randomByDiff(admin_cookie, "1");
        expect(body).toHaveProperty('message', 'NoWordsForDifficulty')
    })

    it.only('admin sign out', async () => {
        const body = await signOut(admin_cookie)
        expect(body).toHaveProperty('code', 0)
    })
})