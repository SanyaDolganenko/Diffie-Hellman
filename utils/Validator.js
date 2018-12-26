const {check, validationResult} = require('express-validator/check');

const {matchedData, sanitize} = require('express-validator/filter');

var processor = require('../utils/Processor.js');

function getValidationResult(req) {
    return validationResult(req);
}

function validateForRegister() {
    return [
        check('fullName', 'Name cannot be left blank')
            .isLength({min: 1}),

        check('email')
            .isEmail().withMessage('Please enter a valid email address')
            .trim()
            .custom(value => {
                    return processor.findUserByEmail(value).then(user => {
                        if (user != null) {
                            throw new Error("User already exists");
                        }
                    })
                }
            ),
        check('password')
            .isLength({min: 5}).withMessage('Password must be at least 5 chars long')
            .matches(/\d/).withMessage('Password must contain one number')
            .custom((value, {req, loc, path}) => {
                if (value !== req.body.confirmPassword) {
                    // throw error if passwords do not match
                    throw new Error("Passwords don't match");
                } else {
                    return value;
                }
            })
    ]
}

function validateForLogin() {
    return [
        check('email', 'email cannot be null')
            .isEmail().withMessage('Please enter a valid email address')
            .trim()
            .custom(value => {
                    return processor.findUserByEmail(value).then(user => {
                        if (user == null) {
                            throw new Error("User does not exist");
                        }
                    })
                }
            ),
        check('password', 'password cannot be null or empty')
    ]
}


function validateForAddingEvent() {
    return [
        check('eventName', 'eventName cannot be null').isLength({min: 1}).withMessage('evenName cannot be empty'),
        check('adminEmail', 'adminEmail must be defined and not empty').isLength({min: 1}),
    ]
}

function validateForAddingGroupInEvent() {
    return [
        check('eventName', 'eventName cannot be null')
            .isLength({min: 1})
            .withMessage('evenName cannot be empty')
            .custom(value => {
                    return processor.findEventByName(value).then(event => {
                        if (event == null) {
                            throw new Error("Event does not exist");
                        }
                    })
                }
            ),
        check('groupName', 'groupName cannot be null').isLength({min: 1}).withMessage('groupName cannot be empty'),
        check('adminEmail', 'adminEmail must be defined and not empty').isLength({min: 1}),
    ]
}

function validateForAddingEventUsers() {
    return [
        check('eventName', 'eventName cannot be null').custom(value => {
                return processor.findEventByName(value).then(event => {
                    if (event == null) {
                        throw new Error("Event does not exist");
                    }
                })
            }
        ),
        check('userEmails', 'userEmails cannot be null')
            .custom(value => {
                return Array.isArray(value )&& value.length > 0;
            }).withMessage("userEmails must be an array and not empty")
    ]
}

module.exports = {
    validateForRegister,
    getValidationResult,
    validateForLogin,
    validateForAddingEvent,
    validateForAddingGroupInEvent,
    validateForAddingEventUsers,
};