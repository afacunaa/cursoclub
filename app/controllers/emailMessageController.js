/**
 * Created by andres on 04/10/18.
 */

let EmailMessage = require('../models/emailMessage');
let User = require('../models/user');
let constants = require('../../config/constants');
let async = require('async');

// Display all EmailMessage GET
exports.emailMessage_list = function (req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.role === constants.admin_role) {
            EmailMessage.find({})
                .exec(function (err, list_emailMessage) {
                    if (err) {
                        return next(err)
                    }
                    res.render('emailMessage_list', {
                        title: 'Lista de correos',
                        metaDescription: "",
                        emailMessage_list: list_emailMessage,
                        user: req.user
                    });
                });
        } else {
            res.redirect('/home');
        }
    } else {
        res.redirect('/login');
    }
};

// Display the details of a EmailMessage GET
exports.emailMessage_detail_get = function (req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.role === constants.admin_role) {
            async.parallel({
                findMessage: function (callback) {
                    EmailMessage.findById(req.params.id, callback)
                },
                findAllUsers: function (callback) {
                    User.find({'active.isActive': true}, callback);
                }
            }, function (err, results) {
                if (err) {
                    return next(err);
                }
                let roleNames = {};
                roleNames[constants.admin_role] = 'Administrador';
                roleNames[constants.teacher_role] = 'Instructor';
                roleNames[constants.student_role] = 'Usuario';
                res.render('emailMessage_detail',
                    {
                        title: 'Correo ' + results.findMessage.name,
                        emailMessage: results.findMessage,
                        usersList: results.findAllUsers,
                        roleNames: roleNames,
                        metaDescription: "",
                        user: req.user
                    });
                }
            );
        } else {
            res.redirect('/home');
        }
    } else {
        res.redirect('/login');
    }
};

// Create a EmailMessage GET
exports.emailMessage_create_get = function (req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.role === constants.admin_role) {
            res.render('create_emailMessage', {title: 'Crear correo', metaDescription: "", user: req.user});
        } else {
            res.redirect('/home');
        }
    } else {
        res.redirect('/login');
    }
};

// Create a EmailMessage POST
exports.emailMessage_create_post = function (req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.role === constants.admin_role) {
            let emailMessage = new EmailMessage(
                {
                    name: req.body.name,
                    idName: req.body.idName,
                    body: req.body.body,
                    periodicity: req.body.periodicity
                }
            );
            emailMessage.save(function (err) {
                if (err) {
                    return next(err)
                }
                res.redirect(emailMessage.url);
            });
        } else {
            res.redirect('/home');
        }
    } else {
        res.redirect('/login');
    }
};

// Update a EmailMessage GET
exports.emailMessage_update_get = function (req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.role === constants.admin_role) {
            EmailMessage.findById(req.params.id).exec(function (err, result) {
                if (err) {
                    return next(err)
                }
                res.render('edit_emailMessage', {title: 'Editar Correo', metaDescription: "", emailMessage: result, user: req.user})
            });
        } else {
            res.redirect('/home');
        }
    } else {
        res.redirect('/login');
    }
};

// Update a EmailMessage POST
exports.emailMessage_update_post = function (req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.role === constants.admin_role) {
            EmailMessage.findOneAndUpdate({ _id: req.params.id }, {
                $set:
                    {
                        name: req.body.name,
                        idName: req.body.idName,
                        body: req.body.body,
                        periodicity: req.body.periodicity,
                        updatedAt: new Date()
                    }
            }, {new: true}, function (err, doc) {
                res.redirect(doc.url);
            });
        } else {
            res.redirect('/home');
        }
    } else {
        res.redirect('/login');
    }
};


exports.emailMessage_send_post = function (req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.role === constants.admin_role) {
            EmailMessage.findById({ _id: req.params.id }, {
                $set:
                    {
                        name: req.body.name,
                        idName: req.body.idName,
                        body: req.body.body,
                        periodicity: req.body.periodicity,
                        updatedAt: new Date()
                    }
            }, {new: true}, function (err, doc) {
                res.redirect(doc.url);
            });
        } else {
            res.redirect('/home');
        }
    } else {
        res.redirect('/login');
    }
};