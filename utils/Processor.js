require('../models/User');
require('../models/Event');
require('../models/Group');
const mongooseOptions = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    autoIndex: false, // Don't build indexes
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0,
    connectTimeoutMS: 100000, // Give up initial connection after 10 seconds
    socketTimeoutMS: 450000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
};
const mongoClientOptions = {
    useNewUrlParser: true
};
var url = "mongodb://<username>:<password>@ds055699.mlab.com:55699/knowme";
var mongoUserName = "sasha.dolganenko";
var mongoPassword = "testing1999"

var MongoClient = require('mongodb').MongoClient;
var db;
MongoClient.connect(url.replace("<username>", mongoUserName).replace("<password>", mongoPassword), mongoClientOptions,
    function (err, dbResult) {
        if (err) {
            throw err;
        } else {
            db = dbResult;
        }
    });

var mongoose = require('mongoose');
var encryption = require('../utils/Encryption.js');
mongoose.connect(url.replace("<username>", mongoUserName).replace("<password>", mongoPassword), mongooseOptions);
var User = mongoose.model('Users');
var Event = mongoose.model('Events');
var Group = mongoose.model('Groups');

/**=============GET================*/

var getEvents = function (req, res) {
    var events = [];
    Event.find().exec((err, result) => {
        if (err) throw err;
        events = result;
        console.log(events);
        res.json(events);
    });
};

function getUser(req, res) {
    if (req.params.id) {
        var emailBase64 = req.params.id;
        getUserByEmail(req.params.id, (err, user) => {
            console.log(user);
            if (err) {
                res.json({message: err, status: "error"});
                throw err;
            }

            res.json(user);
        })
    } else {
        res.json({message: "No param", status: "error"})
    }
}


function getGroups(req, res) {
    if (req.params.eventId) {
        getGroupsByEventId(req.params.eventId, (err, docs) => {
            if (err) {
                res.json({message: err, status: "error"});
                throw err;
            } else {
                res.json(docs);
            }
        });
    }
}


/**=============POST================*/

var register = function (req, res, errors) {

    if (!errors.isEmpty()) {

        res.json({status: "error", message: errors.array()});
    } else {
        var encryptedPassword = '';
        encryption.cryptPassword(req.body.password,
            (err, hash) => {
                if (err) {
                    throw  err;
                }
                encryptedPassword = hash;
                var document = {
                    fullName: req.body.fullName,
                    email: req.body.email,
                    password: encryptedPassword,

                };

                var user = new User(document);
                user.save(function (error) {
                    console.log(user);
                    if (error) {
                        throw error;
                    }
                    res.json({message: "Data saved successfully.", status: "success"});
                });
            });
    }
};

var login = function (req, res, errors) {
    if (!errors.isEmpty()) {
        res.json({status: "error", message: errors.array()});
    } else {
        var email = req.body.email;
        var password = req.body.password;
        getUserByEmail(email, (err, user) => {
            if (err) {
                throw err;
            }
            if (user !== null) {
                encryption.comparePassword(password, user.password,
                    (err, matches) => {
                        if (err) throw  err;
                        if (matches) {
                            user.online = true;
                            user.save((err) => {
                                console.log(user);
                                if (err) throw  err;
                                res.json({message: "Successful login", status: "success"});
                            });
                        } else {
                            res.send({message: "Incorrect password", status: "error"});
                        }
                    });
            }
        });
    }
};

function logout(req, res, errors) {
    if (!errors.isEmpty()) {
        res.json({status: "error", message: errors.array()});
    } else {
        getUserByEmail(req.body.email, (err, user) => {
            if (err) throw  err;
            user.online = false;
            user.save((err) => {
                console.log(user);
                if (err) throw  err;
                res.json({message: "Successful logout", status: "success"});
            })
        });
    }
}


function addEvent(req, res, errors) {
    if (!errors.isEmpty()) {
        res.json({status: "error", message: errors.array()});
    } else {
        //TODO password should be encrypted. Make sure to decrypt.
        //TODo check if user is admin.
        var adminEmail = req.body.adminEmail;
        //TODO check if user is online.
        var userEmails = [];
        if (req.body.userEmails) {
            userEmails = req.body.userEmails;
        }

        var isAttendenceControlled = false;
        if (req.body.isAttendenceControlled) {
            isAttendenceControlled = req.body.isAttendenceControlled;
        }
        var document = {
            eventName: req.body.eventName,
            eventTopics: {},
            userEmails: userEmails,
            adminEmail: adminEmail,
            isAttendenceControlled: isAttendenceControlled
        };
        var event = new Event(document);
        // var eventTopics = objectToMap();
        Object.keys(req.body.eventTopics).forEach(k => {
            event.eventTopics.set(k.toString(), req.body.eventTopics[k].toString());
        });

        event.save(function (error) {
            console.log(event);
            if (error) {
                throw error;
            }
            res.json({message: "Data saved successfully.", status: "success"});
        })
    }
}

function addGroupInEvent(req, res, errors) {
    if (!errors.isEmpty()) {
        res.json({status: "error", message: errors.array()});
    } else {
        var adminEmail = req.body.adminEmail;
        var userEmails = [];
        if (req.body.userEmails) {
            userEmails = req.body.userEmails;
        }
        var groupDescription = "";
        if (req.body.groupDescription) {
            groupDescription = req.body.groupDescription;
        }
        getEventByName(req.body.eventName, (err, doc) => {
            if (err) throw  err;
            var document = {
                    eventId: doc._id,
                    groupName: req.body.groupName,
                    groupDescription: groupDescription,
                    userEmails: userEmails,
                    adminEmail: adminEmail,
                }
            ;
            var group = new Group(document);
            group.save(err => {
                if (err) throw err;
                console.log(group);
                res.json({message: "Data saved successfully", status: "success"});
            })
        });
    }
}

function addEventUsers(req, res, errors) {
    if (!errors.isEmpty()) {
        res.json({status: "error", message: errors.array()});
    } else {
        var usersArray = req.body.userEmails;
        var eventName = req.body.eventName;
        getEventByName(eventName, (err, event) => {
            if (err) {
                res.json({message: err, status: "error"});
                throw err;
            } else if (event != null) {
                usersArray.forEach((userEmail) => {
                    //TODO also check if user exists.
                    if (!event.userEmails.includes(userEmail)) {
                        event.userEmails.push(userEmail);
                    }
                });
                event.save(err => {
                    if (err) throw  err;
                    console.log(event);
                    res.json({message: "Data saved successfully", status: "success"});
                });
            }
        });
    }
}

/**=============DATABASE FUNCTIONS================*/

function getUserByEmail(email, callback) {
    if (email) {
        User.findOne({email: email})
            .exec((err, doc) => {
                if (err) {
                    callback(err, null);
                }
                callback(null, doc);
            })
    }
}

function findUserByEmail(email) {
    if (email) {
        return new Promise((resolve, reject) => {
            User.findOne({email: email})
                .exec((err, doc) => {
                    if (err) {
                        return reject(err)
                    }
                    // if (doc) return reject(new Error('This email already exists. Please enter another email.'))
                    else return resolve(doc)
                })
        })
    }
}

function getEventByName(eventName, callback) {
    if (eventName) {
        Event.findOne({eventName: eventName})
            .exec((err, doc) => {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, doc);
                }
            })
    }
}

function findEventByName(eventName) {
    if (eventName) {
        return new Promise((resolve, reject) => {
            Event.findOne({eventName: eventName})
                .exec((err, doc) => {
                    if (err) {
                        return reject(err)
                    }
                    else return resolve(doc)
                })
        })
    }
}

function getGroupsByEventId(eventId, callback) {
    if (eventId) {
        Group.find({eventId: eventId}).exec((err, doc) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, doc);
            }
        });
    } else {
        callback(new Error("Provide an id"), null);
    }
}


module.exports = {
    getEvents,
    getGroups,
    register,
    login,
    logout,
    addEvent,
    getUser,
    findUserByEmail,
    findEventByName,
    addGroupInEvent,
    addEventUsers
};