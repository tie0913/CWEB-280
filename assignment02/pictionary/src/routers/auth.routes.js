const { Router } = require('express');
const ctrl = require('../controllers/auth.controller');
const {authValidator} = require('../controllers/auth.validator')
const router = Router();

router.post('/signIn', ctrl.signIn.bind(ctrl))
router.post('/signUp', ctrl.signUp.bind(ctrl))
router.post('/deleteAccount', authValidator, ctrl.deleteAccount.bind(ctrl))
router.post('/signOut', authValidator, ctrl.signOut.bind(ctrl))

module.exports= router