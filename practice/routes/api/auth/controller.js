const User = require('../../../models/user')
const jwt = require('jsonwebtoken')

exports.register = (req, res) => {
  const {username, password} = req.body
  let newUser = null

  //create a new user if does not exist
  const create = (user) => {
    if (user) {
      throw new Error('username exists')
    } else {
      return User.create(username, password)
    }
  }

  //count the number of user
  const count = (user) => {
    newUser = user
    return User.count({}).exec()
  }

  //assign admin if count is 1
  const assign = (count) => {
    if (count === 1) {
      return newUser.assignAdmin()
    } else {
      return Promise.resolve(false)
    }
  }

  //respond to the client
  const respond = (isAdmin) => {
    res.json({
      message: 'registered successfully',
      admin: isAdmin
        ? true
        : false
    })
  }

  //run when there is an error (username exists)
  const onError = (error) => {
    res.status(409).json({message: error.message})
  }

  //check username duplicatoin
  User.findOneByUsername(username).then(create).then(count).then(assign).then(respond).catch(onError)
}

exports.login = (req, res) => {
  const {username, password} = req.body
  const secret = req.app.get('jwt-secret')

  //check the user info & generate the JWT
  const check = (user) => {
    if (!user) {
      throw new Error('login failed')
    } else {
      if (user.verify(password)) {
        //create a promise that generates jwt asynchronously
        return new Promise((resolve, reject) => {
          jwt.sign({
            _id: user._id,
            username: user.username,
            admin: user.admin
          }, secret, {
            expiresIn: '7d',
            issuer: 'qkreltms.com',
            subject: 'userInfo'
          }, (err, token) => {
            if (err)
              reject(err)
            resolve(token)
          })
        })
        //토큰만들고 로컬스토라지에 저장
      } else {
        throw new Error('login failed')
      }
    }
  }

  //respond the Token
  const respond = (token) => {
    res.json({message: 'lgooed in successfully', token})
  }

  //error occured
  const onError = (error) => {
    res.status(403).json({message: error.message})
  }

  //find the user
  User.findOneByUsername(username).then(check).then(respond).catch(onError)
}

exports.check = (req, res) => {
  res.json({success: true, info: req.decoded})
}
