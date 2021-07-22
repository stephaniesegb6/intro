const LocalStrategy = require('passport-local').Strategy;

function initialize(passport, getUserByUsername,getUserById) {
	
	const authenticateUser = (username, password, done) => {
		const user = getUserByUsername(username)
		console.log('Here is user')
		if (user == null) {  
			return done(null, false, { message: 'No user with that email' })
		}

		try {
			if (password == user.password) {
				console.log(password)
				return done(null, user)
			} else {
				return done(null, false, { message: 'Password incorrect' })
			}
		} catch (e) {
			return done(e)
		}
	}
	passport.use(new LocalStrategy({ usernameField: 'username' }, authenticateUser))
	passport.serializeUser((user, done) => {
		return done(null,user.id)
	})
	passport.deserializeUser((id, done) => {
		return done(null,getUserById(id))
	})
}


module.exports = initialize
