/**
 * Created by andres on 16/05/18.
 */

let Conversation = require('../models/conversation');
let constants = require('../../config/constants');
let async = require('async');

// Display all conversation GET
exports.conversation_list = function (req, res, next) {
    //res.send('Lista de transaccions');
    if (req.isAuthenticated()) {
        if(req.user.role !== constants.admin_role) {
            Conversation.find({$or: [{'user1.user': req.user.id}, {'user2.user': req.user.id}]})
                .sort('-lastActive')
                .populate('user1.user user2.user')
                .exec(function (err, conversation_list) {
                    if (err) {
                        return next(err);
                    }
                    res.render('conversation_list', {
                        title: 'Lista de mensajes',
                        conversation_list: conversation_list,
                        user: req.user
                    });
                });
        } else {
            Conversation.find()
                .sort('-lastActive')
                .populate('user1.user user2.user')
                .exec(function (err, conversation_list) {
                    if (err) {
                        return next(err);
                    }
                    res.render('conversation_list', {
                        title: 'Lista de mensajes',
                        conversation_list: conversation_list,
                        user: req.user
                    });
                });
        }
    } else {
        res.redirect('/login');
    }
};

exports.conversation_detail = function (req, res, next) {
    if (req.isAuthenticated()) {
        Conversation.findById(req.params.id)
            .populate('user1.user user2.user')
            .exec(function (err, result) {
                if (err) {
                    return next(err);
                }
                let ownUser, otherUser;
                if (result) {
                    if (req.user.id === result.user1.user.id) {
                        ownUser = result.user1;
                        otherUser = result.user2;
                        if (req.user.role !== 1) {
                            result.user1.unread = false;
                        }
                    } else {
                        ownUser = result.user2;
                        otherUser = result.user1;
                        if (req.user.role !== 1) {
                            result.user2.unread = false;
                        }
                    }
                    result.save();
                res.render('conversation_detail', {
                    title: 'Conversación',
                    ownUser: ownUser,
                    otherUser: otherUser,
                    conversation: result,
                    user: req.user
                });
            }
            })
    } else {
        res.redirect('/login')
    }
};

exports.conversation_new = function (req, res, next) {
    if (req.isAuthenticated()) {
        Conversation.findOne( { 'user1.user': req.user.id, 'user2.user': req.params.id } )
            .populate('user1.user user2.user')
            .exec(function (err, result) {
                if (err) {
                    return next(err);
                }
                if (result) {
                    res.redirect(result.url);
                } else {
                    let conversation = new Conversation(
                        {
                            user1: {
                                user: req.user.id,
                                unread: false
                            },
                            user2: {
                                user: req.params.id,
                                unread: true
                            },
                            message: []
                        });
                    conversation.save();
                    res.redirect(conversation.url);
                }
            })
    } else {
        res.redirect('/login');
    }
};

exports.conversation_detail_new_message = function (req, res, next) {
    if (req.isAuthenticated()) {
        Conversation.findById( req.params.id)
            .populate('user1.user user2.user')
            .exec(function (err, result) {
            if (err) { return next(err) }
            if (result) {
                let message = {
                    text: req.body.message.trim(),
                    sender: req.user.id
                };
                result.message = result.message.concat([message]);
                result.lastActive = Date.now();
                if (req.user.id === result.user1.user.id) {
                    result.user2.unread = true;
                } else {
                    result.user1.unread = true;
                }
                result.save();
                res.redirect(result.url);
            }
        });
    } else {
        res.redirect('/login');
    }
};