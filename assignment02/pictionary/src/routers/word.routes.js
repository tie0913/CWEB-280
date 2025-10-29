const express = require('express');
const ctrl = require('../controllers/words.controller');
const { authValidator, adminValidator } = require('../auth/auth.validator');

const router = express.Router();
router.use(authValidator);

router.get('/', (req, res) => ctrl.list(req, res));
router.get('/random', (req, res) => ctrl.random(req, res));
router.get('/random/:difficulty', (req, res) => ctrl.randomByDifficulty(req, res));

router.post('/', adminValidator, (req, res) => ctrl.create(req, res));
router.put('/:id', adminValidator, (req, res) => ctrl.update(req, res));
router.delete('/:id', adminValidator, (req, res) => ctrl.remove(req, res));

module.exports = router;