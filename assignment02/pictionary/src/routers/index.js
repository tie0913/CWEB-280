const { Router } = require('express');
const auth = require('./auth.routes')
const users = require('./users.routes');
const rooms = require('./rooms.routes');

const router = Router();
router.use('/auth', auth)
//router.use('/users', users)
//router.use('/rooms', rooms);

module.exports = router;
