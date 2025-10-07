const service = require('../services/users.service');

exports.listUsers = async (req, res, next) => {
  try {
    const data = await service.listUsers();
    res.json({ data });
  } catch (e) { next(e); }
};

exports.createUser = async (req, res, next) => {
  try {
    const created = await service.createUser(req.body);
    res.status(201).json({ data: created });
  } catch (e) { next(e); }
};
