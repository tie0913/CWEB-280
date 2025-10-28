const { Router } = require('express');
const ctrl = require('../controllers/users.controller');
const {authValidator, adminValidator} = require('../controllers/auth.validator')
const router = Router();

/**
 * a user get themselves info
 * ok
 */
router.get('/self', authValidator, ctrl.self.bind(ctrl));
/**
 * update user by him/herself
 */
router.post('/self/update', authValidator, ctrl.selfUpdate.bind(ctrl))
/**
 * get user info 
 * this is only provided for admin
 * ok
 */
router.get('/get/:userId', authValidator, adminValidator, ctrl.detail.bind(ctrl))
/**
 * update user's info
 * this is only provided for admin
 */
router.post('/patch', authValidator, adminValidator, ctrl.update.bind(ctrl))

/**
 * ok
 */
router.post('/ban/:userId', authValidator, adminValidator, ctrl.ban.bind(ctrl))

/**
 * ok
 */
router.post('/restore/:userId', authValidator, adminValidator, ctrl.restore.bind(ctrl))
/**
 * query user list
 * ok
 */
router.get('/list', authValidator, adminValidator, ctrl.getUserList.bind(ctrl))


module.exports = router;
