const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

// Passport is strategy-based. We use the local strategy, which authenticates
// against our own Mongo collection. Swapping this one registration for a
// different strategy (LDAP, Google, SAML) would change the authentication
// mechanism without touching the rest of the application.
passport.use(new LocalStrategy(
    { usernameField: 'email' },     // our users log in with email, not username
    async (username, password, done) => {
        try {
            const user = await User.findOne({ email: username }).exec();

            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));
