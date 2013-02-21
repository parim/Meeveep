var db = require('../util/db.js');
var error = require('../util/error.js');
var util = require('../util/util.js');
var user = require('./user.js');

module.exports = {
    /**
     * Check if the user's credentials match, and if they do return the user's information
     */
    login: function (username, password, callback) {
        // First, check if the username and password matches
        db.redisConnect(function (err, client) {
            if(err) {
                return callback(err);
            }
            
            // Get the user's information
            user.getUser(username, function (err, userInfo) {
                if(err) {
                    return error(0x2900, err);
                }
                
                userInfo = userInfo.userData;
                
                // Check password
                if(userInfo.password !== util.hash(password, username)) {
                    return callback(error(0x2901, err));
                }
                
                // Check account status
                if(!userInfo.status === 'active') {
                    return callback(error(0x2902, err));
                }
                
                // Login successful
                callback(null, userInfo); // userInfo should contain username, password, status and userId. Full account information will be saved in the MongoDB collection "users"
            });
        });
    }
};


