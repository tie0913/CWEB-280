const { Router } = require('express');
const ctrl = require('../controllers/users.controller');
const router = Router();

router.get('/', ctrl.listUsers);
router.post('/', ctrl.createUser);

module.exports = router;
