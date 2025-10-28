const {ObjectId} = require('mongodb')
const userService = require('../services/users.service');
const { succeed, fail } = require('../util/response');
const {bsonToJs, jsToBson} = require('../util/converter')
const {updateUserSchema, updateUserByAdminSchema} = require('../schemas/user.joi')
const r = require('../util/list.param.reader');
const { bizLogger } = require('../util/biz_logger');

class UserController{

  async self(req, resp){
    return resp.status(200).json(succeed(req.user))
  }


  async selfUpdate(req, resp){

    const {error, value} = updateUserSchema.validate(req.body)

    if(error){
      return resp.status(400).json(fail(1, error.details.map(d => d.message)))
    }

    try{
      const current = req.user
      const user = jsToBson(value)
      user.admin = current.admin
      user.status = current.status
      await userService.updateUser(user)
      return resp.status(200).json(succeed("updateing user has succeed"))
    }catch(e){
      return resp.status(500).json(fail(-1, "updating user has error", null))
    }
  }

  async detail(req, resp){
    try{
      const user = await userService.getUserByObjectId(new ObjectId(req.params.userId));
      delete user.password
      const response = user == null ?  fail(2, "No user is found by the given id", null) : succeed(bsonToJs(user))
      return resp.status(200).json(response)
    }catch(e){
      bizLogger.error('detail has error', e)
      return resp.status(500).json(fail(1, "Server Error", null))
    }
  }


  async update(req, resp){
    const {error, value} = updateUserByAdminSchema.validate(req.body)
    if(error){
      return resp.status(400).json(fail(1, error.details.map(d => d.message)))
    }
    try{
      const user = jsToBson(value)
      await userService.updateUser(user)
      return resp.status(200).json(succeed("updateing user has succeed"))
    }catch(e){
      return resp.status(500).json(fail(-1, "updating user has error", null))
    }
  }

  async ban(req, resp){
    const userId = new ObjectId(req.params.userId)
    try{
      await userService.ban(userId)
      return resp.status(200).json(succeed("banning user has succeed"))
    }catch(e){
      bizLogger.error('ban user has error', e)
      return resp.status(500).json(fail(-1, "banning user has error", null))
    }
  }

  async restore(req, resp){
    const userId = new ObjectId(req.params.userId)
    try{
      await userService.restoreStatus(userId)
      return resp.status(200).json(succeed("Restoring user's status has succeed"))
    }catch(e){
      return resp.status(500).json(fail(-1, "Restoring user's status has error", null))
    }
  }


  async getUserList(req, resp){
    const {filter, page} = r(req)
    try{
      const result = await userService.getUserList(filter, page)
      return resp.status(200).json(succeed(result))
    }catch(e){
      bizLogger.error('get user list has error', e)
      return resp.status(500).json(fail(-1, "Getting user list has error"))
    }
  }
}


module.exports = new UserController()