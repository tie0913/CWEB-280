const { Router } = require('express');
const ctrl = require('../controllers/auth.controller');
const router = Router();

router.post('/signIn', ctrl.signIn.bind(ctrl))
router.post('/signUp', ctrl.signUp.bind(ctrl))
router.post('/signOut', ctrl.signOut.bind(ctrl))

module.exports= router