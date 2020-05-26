require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const passport = require('passport')
const cors = require('cors')

mongoose.connect('mongodb://localhost:27017/api',{
	useNewUrlParser:true,
	useUnifiedTopology: true,
	useCreateIndex:true
})

const connection = mongoose.connection
connection.on('error', (error) => {
	console.log(error)
})

connection.once('open', () => {
	console.log('database connected.')
})


const app = express()

app.use(express.json())
app.use(cors())
app.use('/user', require('./routes/user'))
// app.use(express.static(path.join(__dirname,'public')))
app.use(passport.initialize())
require('./config/passport')(passport)


app.get('/', (req, res, next) => {
	res.status(200).json({success:true, message:'this is not auth route'})		
})


app.listen(process.env.PORT || 3000, () => {
	console.log('server running on PORT:'+process.env.PORT || 3000)
})