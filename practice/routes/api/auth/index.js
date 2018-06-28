const router = require('express').Router()
const {register} = require('./controller')
const {login} = require('./controller')
const {check} = require('./controller')
const authMiddleware = require('../../../middlewares/auth')

router.post('/login', login)
router.post('/register', register)

router.use('/check', authMiddleware)
router.get('/check', check)

module.exports = router
