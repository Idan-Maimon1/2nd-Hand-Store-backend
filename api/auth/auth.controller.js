const authService = require('./auth.service')
const logger = require('../../services/logger.service')

async function login(req, res) {
  const { username, password } = req.body
  try {
    const user = await authService.login(username, password)
    req.session.user = user
    res.json(user)
  } catch (err) {
    logger.error('Failed to Login ' + err)
    res.status(401).send({ err: 'Failed to Login' })
  }
}

async function signup(req, res) {
  try {
    logger.info('req',req.body)
    const { username, password } = req.body
    const account = await authService.signup(req.body)
    logger.debug(`auth.route - new account created: ` + JSON.stringify(account))
    const user = await authService.login(username, password)
    req.session.user = user
    res.json(user)
  } catch (err) {
    if(err==='Username already exist'){
      res.status(500).send({ err: 'username already exist' })
    }
    else{
      res.status(500).send({ err: 'Failed to signup' })
    }
  }
}

async function logout(req, res) {
  try {
    req.session.destroy()
    res.send({ msg: 'Logged out successfully' })
  } catch (err) {
    res.status(500).send({ err: 'Failed to logout' })
  }
}

module.exports = {
  login,
  signup,
  logout,
}
