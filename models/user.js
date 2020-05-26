const mongoose = require('mongoose')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const jsonwebtoken = require('jsonwebtoken')

const pathTokey = path.join(__dirname, '..','id_rsa_priv.pem')
const PRIV_KEY = fs.readFileSync(pathTokey,'utf-8')


const UserSchema = new mongoose.Schema({
	username:{
		type:String,
		required:true
	},
	email:{
		type:String,
		required:true,
		index:{
			unique:true
		}
	},
	hash:{
		type:String,
		required:true
	},
	salt:{
		type:String,
		required:true
	},
	meetingId:{
		type:String
	}
},{emitIndexErrors: true})

module.exports = mongoose.model('auth',UserSchema)

module.exports.genPassword = (password) => {
	const salt = crypto.randomBytes(32).toString('hex')
	const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString()
	return {
		salt:salt,
		hash:hash
	}
}

module.exports.comparePassword = (password, hash, salt) => {
	const newHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString()
	return newHash === hash
}

module.exports.issueJWT = (user) => {
	const id = user._id
	const expiresIn = '1d' 	

	const payload = {
		sub:id,
		iat:Date.now()
	}

	const jwt = jsonwebtoken.sign(payload,PRIV_KEY,{expiresIn:expiresIn,algorithm:'RS256'})
	return {
		token:'bearer '+jwt,
		expires:expiresIn
	}
}