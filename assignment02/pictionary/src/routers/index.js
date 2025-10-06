const { Router } = require('express');
const users = require('./users.routes');
const rooms = require('./rooms.routes');

const router = Router();
router.use('/users', users);
router.use('/rooms', rooms);

module.exports = router;
