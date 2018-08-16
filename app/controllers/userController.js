/**
 * Created by andres on 6/06/17.
 */

let User = require('../models/user');
let async = require('async');
let bcrypt = require('bcrypt-nodejs');
let emailer = require('../../lib/email');
let uploader = require('../../lib/upload');

// Activate user GET
exports.activate_user_get = function (req, res, next) {
    User.findById( req.params.id ).exec(function (err, result) {
        if (err) {
            return next(err)
        }
        if (result) {
            if (!result.active.isActive) {
                if (req.params.token === result.active.token) {
                    result.active.isActive = true;
                    result.save(function (err) {
                        if (err) {
                            return next(err)
                        }
                        res.render('user_activation', {
                            title: 'Activación de usuario',
                            success: true,
                            message: 'Tu cuenta ha sido activada existosamente, ya puedes ingresar a Curso Club',
                            user: req.user
                        })
                    });
                } else {
                    res.render('user_activation', {
                        title: 'Activación de usuario',
                        success: false,
                        message: 'Tu cuenta NO pudo ser activada, asegúrate que el enlace utilizado fuera el que se te entregó por correo',
                        user: req.user
                    })
                }
            } else {
                res.render('user_activation', {
                    title: 'Activación de usuario',
                    success: false,
                    message: 'Esta cuenta ya fue activada, este enlace ya no es valido',
                    user: req.user
                })
            }
        } else {
            res.render('user_activation', {
                title: 'Activación de usuario',
                success: false,
                message: 'El enlace que estás usando no es valido',
                user: req.user
            })
        }
    })

};

// Update a user GET
exports.update_user_get = function (req, res, next) {
    if ( req.isAuthenticated() ) {
        async.parallel({
                first: function (callback) {
                    User.findById(req.user.id, callback)
                }
            }, function (err, results) {
                if (err) {
                    return next(err)
                }
                res.render('edit_user', {title: 'Editar usuario', user: req.user, message: undefined})
            }
        );
    } else {
        res.redirect('/login');
    }
};

// Update a user POST
exports.update_user_post = function (req, res, next) {
    let subscription = Boolean(req.body.subscription);
    if (req.body.old_password) {
        if (req.user.validPassword(req.body.old_password)) {
            let newHashed = bcrypt.hashSync(req.body.new_password);
            User.findOneAndUpdate({_id: req.user.id}, {
                $set: {
                    email: req.body.email,
                    password: newHashed,
                    subscription: subscription,
                    updatedAt: new Date()
                }
            }, {new: true}, function (err, doc) {
                res.render('edit_user', {title: 'Editar usuario', user: doc, message: 'success' })
            })
        } else {
            User.findById(req.user.id).exec(function (err, result) {
                if (err) {
                    return res.send(err)
                }
                res.render('edit_user', {title: 'Editar usuario', user: result, message: 'failure' })
            })
        }
    } else {
        User.findOneAndUpdate({_id: req.user.id}, {
            $set: {
                email: req.body.email,
                subscription: subscription,
                updatedAt: new Date()
            }
        }, {new: true}, function (err, doc) {
            res.render('edit_user', {title: 'Editar usuario', user: doc, message: 'email' })
        });
    }
};

//Update user's picture POST
exports.update_user_picture_post = function (req, res, next) {
    uploader.uploadFile(req, 'User');
    res.redirect('/home');
};

//Recover password GET
exports.recovery_user_get = function (req, res, next) {
    //let continueProcess = req.query.continueProcess ? req.query.continueProcess : undefined;
    res.render('recover_password', {
        title: 'Recuperar contraseña',
        user: req.user,
        continueProcess: req.query.continueProcess,
        done: req.query.done
    });
};

//Recover password POST
exports.recovery_user_post = function (req, res, next) {
    if (req.body.submit === 'yes'){
        User.findOne({email: req.query.user})
            .exec(function (err, result) {
                if (err) {
                    return next(err);
                }
                if (result) {
                    if (result.recoveryProcess.active && req.query.key === result.recoveryProcess.secretKey) {
                        result.password = bcrypt.hashSync(req.body.new_password);
                        result.updatedAt = new Date();
                        result.recoveryProcess.active = false;
                        result.save();
                    }
                }
                res.redirect('/login');
            })
    } else {
        User.findOne({email: req.body.username})
            .exec(function (err, result) {
                if (err) {
                    return next(err);
                }
                if (result) {
                    result.recoveryProcess.active = true;
                    let hashedKey = bcrypt.hashSync(req.body.new_password);
                    result.recoveryProcess.secretKey = hashedKey;
                    result.save();
                    emailer.recoverPassword(result, hashedKey)
                }
                res.redirect('/user/recovery?done=yes')
            });
    }
};