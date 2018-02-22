/**
 * Created by andres on 21/01/18.
 */

let UsageTrack = require('../models/usageTrack');
let constants = require('../../config/constants');

// Display all usageTrack GET
exports.usageTrack_list = function (req, res, next) {
    //res.send('Lista de transaccions');
    if (req.isAuthenticated()){
        if (req.user.role === constants.admin_role) {
            UsageTrack.find({})
                .exec(function (err, list_usageTrack) {
                    if (err) {
                        return next(err)
                    }
                    res.render('usageTrack_list', {
                        title: 'Registro de navegación de usuarios',
                        usageTrack_list: list_usageTrack,
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