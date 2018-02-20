/**
 * Created by andres on 09/02/18.
 */

let Bill = require('../models/bill');
let Lesson = require('../models/lesson');
let Teacher = require('../models/teacher');
let Transaction = require('../models/transaction');
let constants = require('../../config/constants');
let emailer = require('../../lib/email');
let async = require('async');

// Display all bills GET
exports.bill_list = function (req, res, next) {
    res.send('Lista de facturas');
};

// Display the details of a bill GET
exports.bill_detail = function (req, res, next) {
    //res.send('Detalle de factura ' + req.params.id);
    Bill.findById( req.params.id )
        .populate('teacher student payment')
        .exec(function (err, result) {
            if (err) { return next(err) }
            Lesson.find({ 'bill': result.id })
                .sort('date')
                .populate('course')
                .exec(function (err, list_lessons) {
                    if (err) { return next(err) }
                    res.render('bill_detail', { title: 'Listado de clases en esta solicitud', bill: result, list_lessons: list_lessons, user: req.user })
                });
        });
};

// Create a bill GET
exports.create_bill_get = function (req, res, next) {
    res.send('Crear factura');
};

// Create a bill POST
exports.create_bill_post = function (req, res, next) {
    res.send('Crear factura');
};

// Delete a bill GET
exports.delete_bill_get = function (req, res, next) {
    res.send('Eliminar factura ' + req.params.id);
};

// Delete a bill POST
exports.delete_bill_post = function (req, res, next) {
    res.send('Eliminar factura ' + req.params.id);
};

// Update a bill GET
exports.update_bill_get = function (req, res, next) {
    res.send('Actualizar factura ' + req.params.id);
};

// Update a bill POST
exports.update_bill_post = function (req, res, next) {
    res.send('Actualizar factura ' + req.params.id);
};

exports.update_bill_state_post = function (req, res, next) {
    //res.send('Estado recibido: '+req.body.state +' | ID de clase: '+req.params.id);
    let updateBillValues = {};
    let updateLessonValues = {};
    let description;
    if (req.body.state === '1') {
        updateBillValues['state'] = constants.billAcceptedState;
        updateLessonValues['state'] = constants.lesson_accepted;
        description = ' clases aceptadas. Cambio en estado de clases a: ' + constants.lesson_accepted
    } else if (req.body.state === '0') {
        updateBillValues['state'] = constants.billCanceledState;
        updateLessonValues['state'] = constants.lesson_canceled;
        description = ' clases canceladas. Cambio en estado de clases a: ' + constants.lesson_canceled
    } else if (req.body.state === '2') {
        updateBillValues['state'] = constants.billPaidState;
        updateLessonValues['state'] = constants.lesson_paid;
        description = ' clases pagadas. Cambio en estado de clases a: ' + constants.lesson_paid
    } else if (req.body.state === '3') {
        updateBillValues['state'] = constants.billPendingState;
        updateLessonValues['state'] = constants.lesson_booked;
        description = ' clases solicitadas. Cambio en estado de clases a: ' + constants.lesson_booked
    } else if (req.body.state === '4') {
        updateBillValues['state'] = constants.billDoneState;
        updateLessonValues['state'] = constants.lesson_done;
        description = ' clases finalizadas. Cambio en estado de clases a: ' + constants.lesson_done;
    }
    updateBillValues['updatedAt'] = new Date();
    updateLessonValues['updatedAt'] = new Date();
    Bill.findByIdAndUpdate(req.params.id, { $set: updateBillValues }, { new: true }, function(err, doc) {
        if (err) {res.send(err)}
        if (req.body.state === '4'){
            async.parallel({
                teacher_update: function (callback) {
                    Teacher.findById( doc.teacher, callback )
                        .exec(function (err, result) {
                            if (err){return res.send(err)}
                            if (result.score === undefined){
                                result.score = Number(req.body.score);
                            } else {
                                result.score = (result.score + Number(req.body.score)) / 2;
                            }
                            result.save(function (err) {
                                if (err) { return res.send(err) }
                            })
                        })
                },
                lesson_update: function (callback) {
                    Lesson.update({ 'bill': doc.id }, { $set: updateLessonValues }, { multi: true, new: true },
                        function (err, lesson) {
                            if (err) { res.send(err) }
                            let transaction = new Transaction(
                                {
                                    bill: doc.id,
                                    description: description
                                }
                            );
                            transaction.save(callback);
                        });
                }
            }, function (err, results) {
                    if (err) {
                        return next(err)
                    }
                    res.redirect('/lessons');
                }
            );
        } else {
            Lesson.update({ 'bill': doc.id }, { $set: updateLessonValues }, { multi: true, new: true },
                function (err, lesson) {
                    if (err) { res.send(err) }
                    let transaction = new Transaction(
                        {
                            bill: doc.id,
                            description: lesson.length + description
                        }
                    );
                    transaction.save(function (err) {
                        if (err) { return next(err) }
                        //emailer.notificate_change_class_state(doc, '1');
                        res.redirect(doc.url);
                    });
                }
            );
        }
    });

};