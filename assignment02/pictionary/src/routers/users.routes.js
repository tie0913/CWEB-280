const { Router } = require('express');
const ctrl = require('../controllers/users.controller');
const {authValidator, adminValidator} = require('../controllers/auth.validator')
const router = Router();


router.get('/self', authValidator, ctrl.self.bind(ctrl));
router.post('/self', authValidator, ctrl.selfUpdate.bind(ctrl))
router.get('/get/:userId', authValidator, adminValidator, ctrl.detail.bind(ctrl))
router.post('/patch', authValidator, adminValidator, ctrl.update.bind(ctrl))
router.post('/ban/:userId', authValidator, adminValidator, ctrl.ban.bind(ctrl))
router.post('/restore/:userId', authValidator, adminValidator, ctrl.restore.bind(ctrl))
router.get('/list', authValidator, adminValidator, ctrl.getUserList.bind(ctrl))

module.exports = router;
