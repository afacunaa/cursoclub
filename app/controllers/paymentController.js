/**
 * Created by andres on 5/05/17.
 */

let Payment = require('../models/payment');

// Display all payments GET
exports.payment_list = function (req, res, next) {
    //res.send('Lista de pagos');
    Payment.find({ })
        .exec(function (err, list_payments) {
            if (err) { return next(err) }
            res.render('payments', { title: 'Listado de pagos', payments_list: list_payments })
        });
};

// Display the details of a payment GET
exports.payment_detail = function (req, res, next) {
    res.send('Detalle de pago ' + req.params.id);
};

// Create a payment GET
exports.create_payment_get = function (req, res, next) {
    res.send('Crear pago');
};

// Create a payment POST
exports.create_payment_post = function (req, res, next) {
    res.send('Crear pago');
};

// Delete a payment GET
exports.delete_payment_get = function (req, res, next) {
    res.send('Eliminar pago ' + req.params.id);
};

// Delete a payment POST
exports.delete_payment_post = function (req, res, next) {
    res.send('Eliminar pago ' + req.params.id);
};

// Update a payment GET
exports.update_payment_get = function (req, res, next) {
    res.send('Actualizar pago ' + req.params.id);
};

// Update a payment POST
exports.update_payment_post = function (req, res, next) {
    res.send('Actualizar pago ' + req.params.id);
};