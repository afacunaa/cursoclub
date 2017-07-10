/**
 * Created by andres on 5/05/17.
 */

let Transaction = require('../models/transaction');
let Lesson = require('../models/lesson');

// Display all transactions GET
exports.transaction_list = function (req, res, next) {
    //res.send('Lista de transaccions');
    Transaction.find({ })
        .sort('-createdAt')
        .populate( {
            path: 'lesson',
            populate: {
                path: 'course teacher student'
            }
        } )
        .exec(function (err, list_transactions) {
            if (err) { return next(err) }
            res.render('transactions_list', { title: 'Listado de operaciones', transactions_list: list_transactions, user: req.user })
        });
};

// Display the details of a transaction GET
exports.transaction_detail = function (req, res, next) {
    res.send('Detalle de transaccion ' + req.params.id);
};

// Create a transaction GET
exports.create_transaction_get = function (req, res, next) {
    res.send('Crear transaccion');
};

// Create a transaction POST
exports.create_transaction_post = function (req, res, next) {
    res.send('Crear transaccion');
};

// Delete a transaction GET
exports.delete_transaction_get = function (req, res, next) {
    res.send('Eliminar transaccion ' + req.params.id);
};

// Delete a transaction POST
exports.delete_transaction_post = function (req, res, next) {
    res.send('Eliminar transaccion ' + req.params.id);
};

// Update a transaction GET
exports.update_transaction_get = function (req, res, next) {
    res.send('Actualizar transaccion ' + req.params.id);
};

// Update a transaction POST
exports.update_transaction_post = function (req, res, next) {
    res.send('Actualizar transaccion ' + req.params.id);
};