const {ObjectId} = require('mongodb')
const userService = require('../services/users.service');
const { succeed, fail } = require('../util/response');
const {bsonToJs, jsToBson} = require('../util/converter')
const {updateUserSchema, updateUserByAdminSchema} = require('../schemas/user.joi')
const reader = require('../util/list.param.reader');
const { bizLogger } = require('../util/biz_logger');

class UserController{

  /**
   * Get the current user's profile.
   *
   * Fetches user info by ID, removes admin and status fields,
   * and returns the cleaned data.
   *
   * Response:
   *   200: User profile retrieved successfully.
   *   500: Server error while fetching user info.
   */
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

  /**
   * Update the current user's information.
   *
   * Validates input with updateUserSchema. If invalid, returns HTTP 400.
   * Keeps admin and status fields unchanged, then updates the user record.
   *
   * Response:
   *   200: User updated successfully.
   *   400: Invalid input data.
   *   500: Server error during update.
   */
  async selfUpdate(req, resp){

    const {error, value} = updateUserSchema.validate(req.body)
    if(error){
      bizLogger.error('update self has error when validating params', error)
      return resp.status(200).json(fail(1, error.details.map(d => d.message)))
    }

    try{
      const current = req.user
      const user = jsToBson(value)
      console.log(`user pwd=${user.name}`)
      if(!user.password){
        user.password = current.password
        console.log('set up original password')
      }

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
   * Get user details by ID.
   * This is a admin only API
   *
   * Fetches user data using userId from params and removes the password field.
   * Returns the user info if found, or an error message if not.
   *
   * Response:
   *   200: User details or "user not found" message.
   *   500: Server error while fetching user details.
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

  /**
   * Update a user's information (admin only).
   *
   * Validates input with updateUserByAdminSchema.
   * If valid, updates the user record through userService.
   * Only accessible by admin accounts.
   *
   * Response:
   *   200: User updated successfully.
   *   400: Invalid input data.
   *   500: Server error during update.
   */
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

  /**
   * Ban a user by ID (admin only).
   *
   * Calls userService.ban() with the given userId to disable the account.
   * Returns success when completed or an error if the operation fails.
   *
   * Response:
   *   200: User banned successfully.
   *   500: Server error while banning user.
   */
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

  /**
   * Restore a banned user's status (admin only).
   *
   * Calls userService.restoreStatus() with the given userId.
   * Returns success when the user is restored or an error if it fails.
   *
   * Response:
   *   200: User restored successfully.
   *   500: Server error while restoring user.
   */
  async restore(req, resp){
    const userId = new ObjectId(req.params.userId)
    try{
      await userService.restoreStatus(userId)
      return resp.status(200).json(succeed("Restoring user's status has succeed"))
    }catch(e){
      return resp.status(500).json(fail(-1, "Restoring user's status has error", null))
    }
  }

  /**
   * Get a paginated list of users (admin only).
   *
   * Reads filter and page info from the request, then fetches data via userService.
   * Returns the user list or an error if retrieval fails.
   *
   * Response:
   *   200: User list retrieved successfully.
   *   500: Server error while fetching user list.
   */
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