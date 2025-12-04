const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');
const { authValidator } = require('../controllers/auth.validator');

//router.use(authValidator);

router.post('/', authValidator, (req, res) => roomController.createRoom(req, res));
router.get('/', (req, res) => roomController.list(req, res));
router.get('/fetch', (req, res) => roomController.fetch(req, res))
router.post('/rr', (req, res) => roomController.refresh(req, res))
router.post('/:roomId/join', authValidator, (req, res) => roomController.join(req, res));
router.post('/:roomId/leave', authValidator, (req, res) => roomController.leave(req, res));
router.post('/:roomId/start', authValidator, (req,res) => roomController.start(req,res));
router.put('/:roomId', authValidator, (req, res) => roomController.updateByAdmin(req, res));

module.exports = router;