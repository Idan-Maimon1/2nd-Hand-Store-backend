const logger = require('../services/logger.service')
const asyncLocalStorage = require('../services/als.service')

async function setupAsyncLocalStorage(req, res, next) {
  const storage = {}
  asyncLocalStorage.run(storage, () => {
    if (req.sessionID) {
      const store = asyncLocalStorage.getStore()
      store.sessionId = req.sessionID
      if (req.session.user) {
        store.userId = req.session.user._id
        store.isAdmin = req.session.user.isAdmin
      }
    }
    next()
  })
}

module.exports = setupAsyncLocalStorage