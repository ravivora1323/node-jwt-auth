const router = require('express').Router()
const User = require('../models/user')
const passport = require('passport')


router.post('/register' ,(req, res,next) => {
	if(!req.body.username) {
		res.status(401).json({success:false,message:'username is require'})
	} else if(!req.body.password) {
		res.status(401).json({success:false,message:'password is require'})
	} else if(!req.body.email) {
		res.status(401).json({success:false,message:'email is require'})
	} else {
		const genPassword = User.genPassword(req.body.password)

		const newUser = new User({
			username:req.body.username,
			email:req.body.email,
			hash:genPassword.hash,
			salt:genPassword.salt
		})

		newUser.save().then((user) => {
			const jwt = User.issueJWT(user)
			res.status(200).json({
				success:true, 
				message:'user register successful',
				user:user,
				token:jwt.token,
				expires:jwt.expires
			})
		}).catch((err) => {
			if (err.name == 'MongoError') {
				res.status(401).json({success:false,message:err.errmsg})
			}
		})
	}
})

router.post('/login', (req, res, next) => {
	if(!req.body.password) {
		res.status(401).json({success:false,message:'password is require'})
	} else if(!req.body.email) {
		res.status(401).json({success:false,message:'email is require'})
	} else {
		User.findOne({email:req.body.email}).then((user) => {
			if (!user) {
				res.status(401).json({success:false, message:'email not found.'})
			} else {
				const isValid = User.comparePassword(req.body.password, user.hash, user.salt)
				if (!isValid) {
					res.status(401).json({success:false, message:'password is wrong'})
				} else {
					const jwt = User.issueJWT(user)
					res.status(200).json({success:true, message:'login successful.', user:user, token:jwt.token, expires:jwt.expires})
				}
			}
		}).catch((err) => {
			console.error(err)
		})
	}
})

router.get('/',passport.authenticate('jwt', {session:false}), (req, res, next) => {
	res.status(200).json({success:true, message:'you are authenticated.'})
})
module.exports = router