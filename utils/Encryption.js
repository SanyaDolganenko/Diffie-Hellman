var bcrypt = require('bcrypt-nodejs');

var cryptPassword = function (password, callback) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, null, function (err, hash) {
            console.log(hash);
            return callback(err, hash);
        });
    });
};

var comparePassword = function (plainPass, hashword, callback) {
    bcrypt.compare(plainPass, hashword, function (err, isPasswordMatch) {
        return callback(err, isPasswordMatch);
    });
};

module.exports = {cryptPassword, comparePassword};