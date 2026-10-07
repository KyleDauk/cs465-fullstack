const passport = require('passport');
const User = require('../models/user');

// POST /api/register
// Creates a user and logs them straight in by returning a JWT.
const register = async (req, res) => {
    if (!req.body.name || !req.body.email || !req.body.password) {
        return res
            .status(400)
            .json({ "message": "All fields required" });
    }

    const user = new User();
    user.name = req.body.name;
    user.email = req.body.email;
    user.setPassword(req.body.password);

    try {
        await user.save();
        const token = user.generateJWT();
        return res
            .status(200)
            .json({ token });
    } catch (err) {
        // A duplicate email trips the unique index and lands here.
        // Per 5-1 feedback, the raw database error is not returned: it would
        // expose the index name, the collection and the colliding address.
        const duplicate = err && (err.code === 11000 || err.code === 11001);
        return res
            .status(400)
            .json({ "message": duplicate
                ? "That email address is already registered"
                : "Registration failed" });
    }
};

// POST /api/login
// Delegates the credential check to passport and returns a JWT on success.
const login = (req, res, next) => {
    // Validate message to ensure that email and password are present.
    if (!req.body.email || !req.body.password) {
        return res
            .status(400)
            .json({ "message": "All fields required" });
    }

    // Delegate authentication to the passport module
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            // Error in the authentication process itself. Per 5-1 feedback,
            // the raw error is logged server-side and a generic message is
            // returned, so internals are not disclosed to the caller.
            console.log('Authentication error: ' + (err.message || err));
            return res
                .status(404)
                .json({ "message": "Authentication error" });
        }

        if (user) {     // Auth succeeded - generate JWT and return to caller
            const token = user.generateJWT();
            res
                .status(200)
                .json({ token });
        } else {        // Auth failed - return the reason
            res
                .status(401)
                .json(info);
        }
    })(req, res, next);
};

// Export methods that drive endpoints.
module.exports = {
    register,
    login
};
