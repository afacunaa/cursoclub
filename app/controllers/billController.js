/**
 * Created by andres on 09/02/18.
 */

let Bill = require('../models/bill');
let Lesson = require('../models/lesson');
let Teacher = require('../models/teacher');
let User = require('../models/user');
let Transaction = require('../models/transaction');
let constants = require('../../config/constants');
let emailer = require('../../lib/email');
let async = require('async');
let moment = require('moment');

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
                    res.render('bill_detail', { title: 'Listado de clases en esta solicitud', metaDescription: "", bill: result, list_lessons: list_lessons, user: req.user })
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
    //res.send('Actualizar factura ' + req.params.id);
    if (req.isAuthenticated()) {
        let week = [];
        let notAvailable = [];
        let mustChange = [];
        let hoursADay = constants.hoursADay;
        let firstHour = constants.firstHour;
        let weeksAhead = Number(constants.weeksAhead);
        let monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        let displacement = 0;
        let today = new Date();
        let notToday = new Date(moment(today).add(weeksAhead, 'w')); //new Date(today.setDate(today.getDay() + ( 7 * displacement ) ));
        let firstDay = new Date(moment(today).startOf('isoWeek'));
        let lastDay = new Date(moment(notToday).endOf('isoWeek'));
        for (let i = 0; i < 7; i++) {
            week[i] = new Date(moment(firstDay).add(i, 'd')); // Obtains the Date of the monday of the current week
        }
        async.parallel({
            find_bill: function (callback) {
                Bill.findById(req.params.id, callback)
                    .populate('teacher student payment')
            },
            find_lessons_from_bill: function (callback) {
                Lesson.find({'bill': req.params.id}, callback)
                    .sort('date')
                    .populate('course')
            },
            find_lessons_unavailable: function (callback) {
                Lesson.find({
                    'teacher': req.query.teacherId,
                    'state': {$in: [constants.lesson_accepted, constants.lesson_paid]}
                }, callback);
            },
            find_user_picture: function (callback) {
                User.findOne({ teacher: req.query.teacherId }, callback);
            }
        }, function (err, results) {
            if (err) {
                return res.send(err);
            }
            for (let i = 0; i < results.find_lessons_unavailable.length; i++) {
                if (moment(results.find_lessons_unavailable[i].date).isBetween(moment(firstDay), moment(lastDay), 'day', '[]')) {
                    let day = moment(results.find_lessons_unavailable[i].date).isoWeekday() - 1;
                    let hour = moment(results.find_lessons_unavailable[i].date).hour();
                    notAvailable.push(Math.abs(moment(firstDay).diff(moment(results.find_lessons_unavailable[i].date), 'weeks')) + '' + Number((day * hoursADay) + hour - firstHour));
                }
            }
            for (let i = 0; i < results.find_lessons_from_bill.length; i++) {
                if (moment(results.find_lessons_from_bill[i].date).isBetween(moment(firstDay), moment(lastDay), 'day', '[]')) {
                    let day = moment(results.find_lessons_from_bill[i].date).isoWeekday() - 1;
                    let hour = moment(results.find_lessons_from_bill[i].date).hour();
                    mustChange.push(Math.abs(moment(firstDay).diff(moment(results.find_lessons_from_bill[i].date), 'weeks')) + '' + Number((day * hoursADay) + hour - firstHour));
                }
            }
            res.render('edit_bill',
                {
                    title: 'Reprogramar clases',
                    bill: results.find_bill,
                    list_lessons: results.find_lessons_from_bill,
                    teacher_user: results.find_user_picture,
                    notAvailable: notAvailable,
                    mustChange: mustChange,
                    week: week,
                    monthNames: monthNames,
                    displacement: displacement,
                    firstHour: firstHour,
                    hoursADay: hoursADay,
                    metaDescription: "",
                    user: req.user
                });
        });
    } else {
        res.redirect('/login');
    }
};

// Update a bill POST
exports.update_bill_post = function (req, res, next) {
    //res.send('Actualizar factura ' + req.params.id);
    let lessonDates = [];
    let lessonDatesString = req.body.selectedDates.split(',');
    for (let i=0; i<lessonDatesString.length; i++) {
        lessonDates.push(new Date(lessonDatesString[i]));
    }
    async.parallel({
        update_bill: function (callback) {
            Bill.findByIdAndUpdate(req.params.id, { $set: { 'state': constants.billPendingState, updatedAt: new Date(), total: req.body.totalInput } }, { new: true }, callback);
        },
        remove_lessons: function (callback) {
            Lesson.deleteMany({ 'bill': req.params.id }, callback)
                .exec(
                    function (err, results) {
                        if (err) {
                            return res.send(err);
                        }
                        for (let i=0; i<lessonDates.length; i++) {
                            let lesson = new Lesson(
                                {
                                    date: lessonDates[i],
                                    state: constants.lesson_booked,
                                    address: req.body.address,
                                    numberOfStudents: req.body.numberOfStudents,
                                    student: req.user.student,
                                    message: req.body.lesson_message,
                                    teacher: req.body.teacherId,
                                    course: req.body.courseId,
                                    bill: req.params.id
                                }
                            );
                            lesson.save();
                        }
                    }
                );
        },
        create_transaction: function (callback) {
            let transaction = new Transaction(
                {
                    bill: req.params.id,
                    description: 'Se han reprogramado ' + lessonDates.length + ' clases'
                });
            transaction.save(callback);
        }
    }, function (err, results) {
        if (err) { return res.send(err) }
        emailer.notificate_change_lesson_state(results.update_bill, req.body.state);
        res.redirect(results.update_bill.url);
        }
    );
};

exports.update_bill_state_post = function (req, res, next) {
    //res.send('Estado recibido: '+req.body.state +' | ID de clase: '+req.params.id);
    let updateBillValues = {};
    let updateLessonValues = {};
    let description;
    if (req.body.state === '1') {
        updateBillValues['state'] = constants.billAcceptedState;
        updateLessonValues['state'] = constants.lesson_accepted;
        description = 'Clases aceptadas. Cambio en estado de clases a: ' + constants.lesson_accepted;
    } else if (req.body.state === '0') {
        updateBillValues['state'] = constants.billCanceledState;
        updateLessonValues['state'] = constants.lesson_rejected;
        description = 'Clases canceladas. Cambio en estado de clases a: ' + constants.lesson_canceled;
    } else if (req.body.state === '2') {
        updateBillValues['state'] = constants.billPaidState;
        updateLessonValues['state'] = constants.lesson_paid;
        description = 'Clases pagadas. Cambio en estado de clases a: ' + constants.lesson_paid;
    } else if (req.body.state === '3') {
        updateBillValues['state'] = constants.billPendingState;
        updateLessonValues['state'] = constants.lesson_booked;
        description = 'Clases solicitadas. Cambio en estado de clases a: ' + constants.lesson_booked;
    } else if (req.body.state === '4') {
        updateBillValues['state'] = constants.billDoneState;
        updateLessonValues['state'] = constants.lesson_done;
        description = 'Clases finalizadas. Cambio en estado de clases a: ' + constants.lesson_done;
    }
    updateBillValues['updatedAt'] = new Date();
    updateLessonValues['updatedAt'] = new Date();
    Bill.findByIdAndUpdate(req.params.id, { $set: updateBillValues }, { new: true }, function(err, doc) {
        if (err) {res.send(err)}
        if (req.body.state === '4') {
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
                            description: description
                        }
                    );
                    transaction.save(function (err) {
                        if (err) { return next(err) }
                        emailer.notificate_change_lesson_state(doc, req.body.state);
                        res.redirect(doc.url);
                    });
                }
            );
        }
    });

};