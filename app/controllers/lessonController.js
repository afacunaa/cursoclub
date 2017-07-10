/**
 * Created by andres on 5/05/17.
 */

let User = require('../models/user');
let Lesson = require('../models/lesson');
let Teacher = require('../models/teacher');
let Student = require('../models/student');
let Course = require('../models/course');
let Transaction = require('../models/transaction');
let constants = require('../../config/constants');
let emailer = require('../../lib/email');
let async = require('async');
let moment = require('moment');

function classifyLessons(list_lessons) {
    let booked = [], accepted = [], rejected = [], canceled = [], paid = [], done = [];
    for (let i=0; i<list_lessons.length; i++) {
        if (list_lessons[i].state === constants.lesson_booked) {
            booked.push(list_lessons[i]);
        } else if (list_lessons[i].state === constants.lesson_accepted) {
            accepted.push(list_lessons[i]);
        } else if (list_lessons[i].state === constants.lesson_rejected) {
            rejected.push(list_lessons[i]);
        } else if (list_lessons[i].state === constants.lesson_canceled) {
            canceled.push(list_lessons[i]);
        } else if (list_lessons[i].state === constants.lesson_paid) {
            paid.push(list_lessons[i]);
        } else {
            done.push(list_lessons[i]);
        }
    }
    return {
        booked: booked,
        accepted: accepted,
        rejected: rejected,
        canceled: canceled,
        paid: paid,
        done: done
    };
}

// Display all lessons GET
exports.lesson_list = function (req, res, next) {
    //res.send('Lista de clases');
    try {
        if (req.user.role === constants.teacher_role){
            Lesson.find({ 'teacher': req.user.teacher })
                .populate('teacher student course')
                .exec(function (err, list_lessons) {
                    if (err) { return next(err) }
                    let new_list_lessons = classifyLessons(list_lessons);
                    res.render('lessons_list', { title: 'Listado de clases', lessons_list: new_list_lessons, user: req.user })
                });
        } else if (req.user.role === constants.student_role){
            Lesson.find({ 'student': req.user.student })
                .populate('teacher student course')
                .exec(function (err, list_lessons) {
                    if (err) { return next(err) }
                    let new_list_lessons = classifyLessons(list_lessons);
                    res.render('lessons_list', { title: 'Listado de clases', lessons_list: new_list_lessons, user: req.user })
                });
        } else {
            Lesson.find({ })
                .populate('teacher student course')
                .exec(function (err, list_lessons) {
                    if (err) { return next(err) }
                    res.render('lessons_list', { title: 'Listado de clases', lessons_list: list_lessons, user: req.user })
                });
        }
    } catch (err) { res.redirect('/login')}
};

// Display the details of a lesson GET
exports.lesson_detail = function (req, res, next) {
    //res.send('Detalle de clase ' + req.params.id);
    Lesson.findById( req.params.id )
        .populate('teacher student course')
        .exec(function (err, result) {
            res.render('lesson_detail', { title: 'Detalle de la clase', lesson: result, user: req.user });
        });
};

// Create a lesson GET
exports.create_lesson_get = function (req, res, next) {
    //res.send('Crear clase');
    let week = [];
    let notAvailable = [];
    let monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    let displacement = Number(req.query.offset);
    let today = new Date();
    let notToday = new Date(moment(today).add(displacement, 'w')); //new Date(today.setDate(today.getDay() + ( 7 * displacement ) ));
    let monday = new Date(moment(notToday).startOf('isoWeek'));
    for (let i = 0; i < 7; i++) {
        week[i] = new Date(moment(monday).add(i, 'd')); // Obtains the Date of the monday of the current week
    }
    async.parallel({
            first: function (callback) {
                Teacher.findById( req.query.teacherId, callback );
            },
            second: function (callback) {
                Course.findById( req.query.courseId, callback );
            },
            third: function (callback) {
                Lesson.find({ 'teacher': req.query.teacherId, 'state': { $in: [constants.lesson_accepted, constants.lesson_paid] } }, callback);
            },
            fourth: function (callback) {
                User.findOne({ teacher: req.query.teacherId }, callback);
            }
        }, function (err, results) {
            if (err) { return next(err) }
            for (let i = 0; i< results.third.length; i++){
                if (moment(results.third[i].date).isBetween(moment(week[0]), moment(week[6]), 'day', '[]')) {
                    let day = moment(results.third[i].date).isoWeekday() - 1;
                    let hour = moment(results.third[i].date).hour();
                    notAvailable.push((day*12)+hour-8);
                }
            }
            res.render('book_lesson', { title: 'Reservar clase', teacher: results.first, course: results.second, teacher_user: results.fourth, notAvailable: notAvailable, week: week, monthNames: monthNames, displacement: displacement, user: req.user }); //res.render('teacher_detail', { title: 'Detalle de profesor', teacher: results.first, teacher_user: results.second, user: req.user });
        }
    );

};

// Create a lesson POST
exports.create_lesson_post = function (req, res, next) {
    let end = req.body.schedule.indexOf('<');
    let dateString = req.body.schedule.substring(0, end);
    let hour = req.body.schedule.substring(end+1, req.body.schedule.length);
    let lessonDate = new Date(dateString);
    lessonDate.setHours(hour);
    lessonDate.setMinutes(0);
    lessonDate.setSeconds(0);
    lessonDate.setMilliseconds(0);
    let lesson = new Lesson(
        {   date: lessonDate,
            state: constants.lesson_booked,
            student: req.user.student,
            message: req.body.lesson_message,
            teacher: req.query.teacherId,
            course: req.query.courseId  }
    );
    let transaction = new Transaction(
        {   lesson: lesson.id,
            description: 'Clase solicitada. Nueva clase apartada' }
    );
    async.parallel({
        update_teacher: function (callback) {
            Teacher.findById( lesson.teacher, callback)
                .exec(function (err, result) {
                    if (err){return res.send(err)}
                    result.lessons.push(lesson.id);
                    result.save(function (err) {
                        if (err) { return res.send(err) }
                    })
                });
        },
        update_student: function (callback) {
            Student.findById( lesson.student, callback)
                .exec(function (err, result) {
                    if (err){return res.send(err)}
                    result.lessons.push(lesson.id);
                    result.save(function (err) {
                        if (err) { return res.send(err) }
                    })
                });
        },
        save_transaction: function (callback) {
            transaction.save(callback);
        },
        save_lesson: function (callback) {
            lesson.save(callback);
        }
    }, function (err, results) {
        if (err) { return next(err) }
        emailer.notificate_new_class(lesson);
        res.redirect(lesson.url);
    });
};

// Delete a lesson GET
exports.delete_lesson_get = function (req, res, next) {
    res.send('Eliminar clase ' + req.params.id);
};

// Delete a lesson POST
exports.delete_lesson_post = function (req, res, next) {
    res.send('Eliminar clase ' + req.params.id);
};

// Update a lesson GET
exports.update_lesson_get = function (req, res, next) {
    //res.send('Actualizar clase ' + req.params.id);
    let week = [];
    let monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    let displacement = Number(req.query.offset);
    let today = new Date();

    let notToday = new Date(moment(today).add(displacement, 'w'));//new Date(today.setDate(today.getDay() + ( 7 * displacement ) ));
    let monday = new Date(moment(notToday).startOf('isoWeek'));
    let notAvailable = [];
    for (let i = 0; i < 7; i++) {
        week[i] = new Date(moment(monday).add(i, 'd')); // Obtains the Date of the monday of the current week
    }
    async.parallel({
            first: function (callback) {
                Lesson.findById( req.params.id, callback )
                    .populate('teacher student course')
            },
            second: function (callback) {
                Lesson.find({ 'teacher': req.query.teacherId, 'state': { $in: [constants.lesson_accepted, constants.lesson_paid] } }, callback);
            }
        }, function (err, results) {
            if (err) { return next(err) }
            for (let i = 0; i< results.second.length; i++){
                if (moment(results.second[i].date).isBetween(moment(week[0]), moment(week[6]), 'day', '[]')) {
                    let day = moment(results.second[i].date).isoWeekday() - 1;
                    let hour = moment(results.second[i].date).hour();
                    notAvailable.push((day*12)+hour-8);
                }
            }
            if (moment(results.first.date).isBetween(moment(week[0]), moment(week[6]), 'day', '[]')) {
                let day = moment(results.first.date).isoWeekday() - 1;
                let hour = moment(results.first.date).hour();
                notAvailable.push((day*12)+hour-8);
            }
            res.render('edit_lesson', { title: 'Reprogramar clase', lesson: results.first, notAvailable: notAvailable, week: week, monthNames: monthNames, displacement: displacement, user: req.user }); //res.render('teacher_detail', { title: 'Detalle de profesor', teacher: results.first, teacher_user: results.second, user: req.user });
        }
    );
};

// Update a lesson POST
exports.update_lesson_post = function (req, res, next) {
    //res.send('Actualizar clase ' + req.params.id);
    let end = req.body.schedule.indexOf('<');
    let dateString = req.body.schedule.substring(0, end);
    let hour = req.body.schedule.substring(end+1, req.body.schedule.length);
    let lessonDate = new Date(dateString);
    lessonDate.setHours(hour);
    lessonDate.setMinutes(0);
    lessonDate.setSeconds(0);
    lessonDate.setMilliseconds(0);
    Lesson.findOneAndUpdate({ _id: req.params.id }, { $set: { state: constants.lesson_booked, date: lessonDate, updatedAt: new Date() } }, { new: true }, function(err, doc) {
        if (err) {res.send(err)}
        emailer.notificate_new_class(doc);
        let transaction = new Transaction(
            {   lesson: doc.id,
                description: 'Clase reprogramada. Cambio en estado de clase a: ' + doc.state }
        );
        transaction.save(function (err) {
            if (err) { return next(err) }
            res.redirect(doc.url)
        });
    });
};

exports.update_lesson_state_post = function (req, res, next) {
    //res.send('Estado recibido: '+req.body.state +' | ID de clase: '+req.params.id);
    if (req.body.state === '1'){
        Lesson.findOneAndUpdate({ _id: req.params.id }, { $set: { state: constants.lesson_accepted, updatedAt: new Date() } }, { new: true }, function(err, doc) {
            if (err) {res.send(err)}
            let transaction = new Transaction(
                {   lesson: doc.id,
                    description: 'Clase aceptada. Cambio en estado de clase a: ' + doc.state }
            );
            transaction.save(function (err) {
                if (err) { return next(err) }
                emailer.notificate_change_class_state(doc, '1');
                res.redirect(doc.url);
            });
        });
    } else if (req.body.state === '0') {
        Lesson.findOneAndUpdate({ _id: req.params.id }, { $set: { state: constants.lesson_rejected, updatedAt: new Date() } }, { new: true }, function(err, doc) {
            if (err) {res.send(err)}
            let transaction = new Transaction(
                {   lesson: doc.id,
                    description: 'Clase rechazada. Cambio en estado de clase a: ' + doc.state }
            );
            transaction.save(function (err) {
                if (err) { return next(err) }
                emailer.notificate_change_class_state(doc, '0');
                res.redirect(doc.url);
            });
        });
    } else if (req.body.state === '2') {
        Lesson.findOneAndUpdate({ _id: req.params.id }, { $set: { state: constants.lesson_canceled, updatedAt: new Date() } }, { new: true }, function(err, doc) {
            let transaction = new Transaction(
                {   lesson: doc.id,
                    description: 'Clase cancelada. Cambio en estado de clase a: ' + doc.state }
            );
            transaction.save(function (err) {
                if (err) { return next(err) }
                res.redirect(doc.url);
            });
        });
    } else if (req.body.state === '3') {
        Lesson.findOneAndUpdate({ _id: req.params.id }, { $set: { state: constants.lesson_paid, updatedAt: new Date() } }, { new: true }, function(err, doc) {
            let transaction = new Transaction(
                {   lesson: doc.id,
                    description: 'Clase pagada. Cambio en estado de clase a: ' + doc.state }
            );
            transaction.save(function (err) {
                if (err) { return next(err) }
                emailer.notificate_change_class_state(doc, '3');
                res.redirect(doc.url);
            });
        });
    } else if (req.body.state === '4') {
        async.parallel({
            teacher_update: function (callback) {
                Teacher.findById( req.body.teacherId, callback )
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
                Lesson.findOneAndUpdate({ _id: req.params.id }, { $set: { state: constants.lesson_done, updatedAt: new Date() } }, { new: true }, function(err, doc) {
                    if (err) {res.send(err)}
                    let transaction = new Transaction(
                        {   lesson: doc.id,
                            description: 'Clase finalizada. Cambio en estado de clase a: ' + doc.state }
                    );
                    transaction.save(function (err) {
                        if (err) { return next(err) }
                        //res.redirect('/lessons');
                    });
                }, callback);
            }
        }, function (err, results) {
            if (err) { return next(err) }
            res.redirect('/lessons');
        });
    } else {
        Lesson.findById( req.params.id )
            .exec(function (err, result) {
                if (err) { res.send(err)}
                res.redirect(result.url);
            });
    }

};