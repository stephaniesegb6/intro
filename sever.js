const Datastore = require('nedb')
const express = require('express')
const passport = require('passport')
const session = require('express-session')
const flash = require('express-flash');
require('dotenv').config()


const database = new Datastore('database.db')
const database_voca = new Datastore('database_voca.db')
const app = express()
const port = process.env.port || 3000
const initializePassport = require('./passport-config');

initializePassport(
	passport,
	username => admin_username.find(user => user.username === username),
	id => admin_username.find(user => user.id === id)
)

database.loadDatabase()
database_voca.loadDatabase()
app.set('views','./views')
app.set('view engine', 'hbs');
app.use(flash());
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

const admin_username = [{
	id: Date.now().toString(),
	username: process.env.USERNAME_ADMIN,
	password: process.env.PASSWORD_ADMIN
}]

let error 

app.get('/', function (req, res) {
	res.render('home',{error : error})
});
app.listen(port, () =>{console.log(`Connect to ${port}`)})


app.use(express.json()) 
app.use(express.urlencoded({ extended: true }))

let user
let voca  

database.find({},(err,data)=>{
	if (err){
		return;
	}

	user = data
})

database_voca.find({},(err,data)=>{
	if(err){
		return;
	}
	voca = data
})

app.post('/',(req,res) =>{
	const data = req.body
	// const time = Date.now()
	// req.body.timestamp = time
	if (data.ques === '' || data.Mess === '' || data.email === ''){
		error = 'Please finish these information before submit'
		console.log(error)
		res.redirect('/')
	}else{
		error = null
		database.insert(data)
		database.find({},(err,data)=>{
			if (err){
				res.end()
				return;
			}

			user = data
			console.log(error)
		})
		res.redirect('/end')
	}
})

let vocabul = null
let check_send
app.post('/eng/incl',(req,res)=>{
	const data_voca = req.body
	console.log(data_voca)

	if(data_voca.Eng === ''||data_voca.type === ''||data_voca.mean ==='' ){
		check_send = 'Vui l??ng nh???p ?????y ????? th??ng tin'
		res.redirect('/eng/incl')
	}else{
		database_voca.find({'Eng':data_voca.Eng.toLowerCase(),'type': data_voca.type,'mean':data_voca.mean.toLowerCase()},(err,data)=>{
			if(data.length === 0){
				check_send = 'B???n ???? g???i th??nh c??ng'
				database_voca.insert({Eng: data_voca.Eng.toLowerCase(),type: data_voca.type,mean:data_voca.mean.toLowerCase()})
				database_voca.find({},(err,data)=>{
					if(err){
						return;
					}
					voca = data
				})
			}else{
				check_send = 'T??? v?? ngh??a n??y ???? c?? trong trang web'
			}
		})
		res.redirect('/eng/incl')
	}
})

app.get('/ad-login',(req,res)=>{
	res.render('ad-login')
})
app.get('/admin',(req,res)=>{
	console.log(req.isAuthenticated())
	if(req.isAuthenticated()){
		res.render('admin',{user : user})
	}else{
		res.redirect('/ad-login')
	}
	
})

app.post('/ad-login',passport.authenticate('local',{
	successRedirect: '/admin',
	failureRedirect: 'ad-login',
	failureFlash: true
}))

app.get('/end',(req,res) => {
	res.render('end')
})
app.get('/app',(req,res)=>{
	res.render('app')
})
app.get('/eng',(req,res) => {
	res.render('eng')
})
app.get('/eng/voca',(req,res)=>{
	res.render('voca',{voca:voca})
})
app.get('/eng/incl',(req,res)=>{
	res.render('include',{check_send:check_send})
})
app.get('/eng/search',(req,res)=>{
	res.render('search',{search:vocabul,check:look_up,result:result,s:check_2})
})
let look_up = null
let result = null
let check_2 = null
app.post('/eng/search',(req,res)=>{
	const data = req.body
	if (data.Eng !== ''){
		database_voca.find({'Eng':data.Eng.toLowerCase()},(err,data)=>{
			if (err){
				return;
			}
			console.log(data.length)
			vocabul = data
			if (data.length === 0){
				result = 'Kh??ng c?? k???t qu???'
			}else{
				result = null
				check_2 = '????y l?? k???t qu??? t??m ki???m c???a b???n'
			}
			return data 
			//console.log(vocabul)
		})
	}else if(data.mean !== ''){
		database_voca.find({'mean':data.mean.toLowerCase()},(err,data)=>{
			if (err){
				return;
			}
			console.log(data.length)
			vocabul = data
			if (data.length === 0){
				result = 'Kh??ng c?? k???t qu???'
			}else{
				result = null
				check_2 = '????y l?? k???t qu??? t??m ki???m c???a b???n'
			}
			return data 
			//console.log(vocabul)
		})
	}else if(data.Eng === '' && data.mean ===''){
		look_up = 'Vui l??ng nh???p t??? ho???c ngh??a tr?????c khi g???i'
	}else{
		database_voca.find({'Eng':data.Eng.toLowerCase(),'mean':data.mean.toLowerCase()},(err,data)=>{
			if (err){
				return;
			}
			console.log(data.length)
			vocabul = data
			if (data.length === 0){
				result = 'Kh??ng c?? k???t qu???'
			}else{
				result = null
				check_2 = '????y l?? k???t qu??? t??m ki???m c???a b???n'
			}
			return data 
		})
	}
	res.redirect('/eng/search')
})
module.exports = app
