const {ObjectId} = require('mongodb')
const userService = require('../services/users.service');
const { succeed, fail } = require('../util/response');
const {bsonToJs, jsToBson} = require('../util/converter')
const {updateUserSchema, updateUserByAdminSchema} = require('../schemas/user.joi')
const reader = require('../util/list.param.reader');
const { bizLogger } = require('../util/biz_logger');

class UserController{

  async self(req, resp){
    try{
      const user = await userService.getUserByObjectId(req.user['_id'])
      delete user.admin
      delete user.status
      return resp.status(200).json(succeed(bsonToJs(user)))
    }catch(e){
      return resp.status(500).json(fail(-1, "query user has error"))
    }
  }


  async selfUpdate(req, resp){

    const {error, value} = updateUserSchema.validate(req.body)
    if(error){
      bizLogger.error('update self has error when validating params', error)
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
      bizLogger.error('update self has error', e)
      return resp.status(500).json(fail(-1, "updating user has error", null))
    }
  }


  /**
   * read a user's information by an administrator
   * @param {} req 
   * @param {*} resp 
   * @returns 
   */
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
      bizLogger.error('update error', error)
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
    const {filter, page} = reader(req)
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