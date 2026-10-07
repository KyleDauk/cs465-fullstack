const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');     // Enable JSON Web Tokens

const tripsController = require('../controllers/trips');
const authController = require('../controllers/authentication');

// Middleware that guards any route it is attached to. It pulls the
// Authorization header off the request, parses out the bearer token and
// verifies it. A broken, malformed or expired token is rejected with a 401
// before the controller ever runs.
function authenticateJWT(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (authHeader == null) {
        console.log('Auth Header Required but NOT PRESENT!');
        return res.sendStatus(401);
    }

    // Expected shape is "Bearer <token>" - two pieces.
    // NOTE: the guide tests `headers.length < 1`, which can never be true
    // because split() always returns at least one element. The real guard
    // is < 2, otherwise a header with no "Bearer " prefix sails through and
    // the token below comes back undefined.
    const headers = authHeader.split(' ');
    if (headers.length < 2) {
        console.log('Not enough tokens in Auth Header: ' + headers.length);
        return res.sendStatus(501);
    }

    const token = headers[1];
    if (token == null) {
        console.log('Null Bearer Token');
        return res.sendStatus(401);
    }

    // NOTE: the guide calls next() outside this callback, so it fires even
    // after a 401 has been sent and Express throws "Cannot set headers after
    // they are sent". It also chains .json() onto .sendStatus(), which has
    // already ended the response. Both are corrected here.
    jwt.verify(token, process.env.JWT_SECRET, (err, verified) => {
        if (err) {
            console.log('Token Validation Error!');
            return res
                .status(401)
                .json({ "message": "Token Validation Error!" });
        }
        req.auth = verified;    // decoded token onto the request for controllers
        next();                 // continue, or the request hangs forever
    });
}

// ---- authentication endpoints (deliberately NOT protected) ----
router
    .route('/register')
    .post(authController.register);

router
    .route('/login')
    .post(authController.login);

// ---- trips ----
// Reads stay open. Anything that changes data requires a valid JWT.
router
    .route('/trips')
    .get(tripsController.tripsList)
    .post(authenticateJWT, tripsController.tripsAddTrip);

router
    .route('/trips/:tripCode')
    .get(tripsController.tripsFindByCode)
    .put(authenticateJWT, tripsController.tripsUpdateTrip)
    .delete(authenticateJWT, tripsController.tripsDeleteTrip);

module.exports = router;
