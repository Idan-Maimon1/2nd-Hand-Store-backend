const bcrypt = require('bcrypt')
const userService = require('../user/user.service')
const logger = require('../../services/logger.service')

async function login(username, password) {
  logger.debug(`auth.service - login with username: ${username}`)

  const user = await userService.getByUsername(username)
  if (!user) return Promise.reject('Invalid username or password')
  delete user.password
  return user
}

async function signup({ username, password, fullname, isAdmin = false }) {
  const saltRounds = 10

  logger.debug(`auth.service - signup with username: ${username}, fullname: ${fullname}`)
  if (!username || !password || !fullname) return Promise.reject('fullname, username and password are required!')
  const user = await userService.getByUsername(username)
  logger.info(user, 'user name exit?')
  if (user) return Promise.reject('Username already exist')

  const hash = await bcrypt.hash(password, saltRounds)
  return userService.add({ username, password: hash, fullname, isAdmin })
}

module.exports = {
  signup,
  login,
}
