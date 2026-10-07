const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Four datapoints per user: email, name, hash and salt. The password itself
// is never stored - only the salt and the hash derived from it.
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    hash: String,
    salt: String
});

// Method to set the password on this record.
// A 16-byte cryptographically random salt is generated per user, so two
// users with the same password still end up with different hashes.
userSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto
        .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
        .toString('hex');
};

// Method to compare an entered password against the stored hash.
// The derivation here must match setPassword exactly or the comparison
// is meaningless.
userSchema.methods.validPassword = function (password) {
    const hash = crypto
        .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
        .toString('hex');
    return this.hash === hash;
};

// Method to generate a JSON Web Token for the current record.
// The payload carries only non-sensitive identifying data - never the
// hash or the salt, because a JWT payload is base64, not encrypted.
userSchema.methods.generateJWT = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name
        },
        process.env.JWT_SECRET,     // secret lives in .env, never in git
        { expiresIn: '1h' }         // token expires an hour after creation
    );
};

const User = mongoose.model('users', userSchema);
module.exports = User;
