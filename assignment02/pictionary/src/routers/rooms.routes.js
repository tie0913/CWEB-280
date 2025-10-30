const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');
const { authValidator } = require('../controllers/auth.validator');

router.use(authValidator);

router.post('/', (req, res) => roomController.createRoom(req, res));
router.get('/', (req, res) => roomController.list(req, res));
router.post('/:roomId/join', (req, res) => roomController.join(req, res));
router.post('/:roomId/leave', (req, res) => roomController.leave(req, res));
router.post('/:roomId/start', (req,res) => roomController.start(req,res));

module.exports = router;