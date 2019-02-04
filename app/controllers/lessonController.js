/**
 * Created by andres on 5/05/17.
 */

let User = require('../models/user');
let Lesson = require('../models/lesson');
let Teacher = require('../models/teacher');
let Student = require('../models/student');
let Course = require('../models/course');
let Transaction = require('../models/transaction');
let Bill = require('../models/bill');
let constants = require('../../config/constants');
let emailer = require('../../lib/email');
let async = require('async');
let moment = require('moment');

function getGroupedLessonsStateName(state) {
    if (state === constants.billPendingState) {
        return "groupPending";
    } else if (state === constants.billAcceptedState) {
        return "groupAccepted";
    } else if (state === constants.billPaidState) {
        return "groupPaid";
    } else if (state === constants.billDoneState) {
        return "groupDone";
    } else {
        return "groupCanceled";
    }
}

// Display all lessons GET
exports.lesson_list = function (req, res, next) {
    //res.send('Lista de clases');
    try {
        let query = {};
        if (req.user.role === constants.teacher_role) {
            query['teacher'] = req.user.teacher;
        } else if (req.user.role === constants.student_role) {
            query['student'] = req.user.student;
        }
        if (req.user.role === constants.teacher_role || req.user.role === constants.student_role) {
            Bill.find( query )
                .exec(function (err, list_bills) {
                    if (err) {
                        return next(err)
                    }
                    let classifiedGroupedLessons = {
                        groupPending: [],
                        groupAccepted: [],
                        groupCanceled: [],
                        groupPaid: [],
                        groupDone: []
                    };
                    if (list_bills.length > 0) {
                        query['bill'] = { $in: list_bills };
                        Lesson.find( query )
                            .sort('date')
                            .populate('teacher student course')
                            .exec(function (err, list_lessons) {
                                if (err) {
                                    return next(err)
                                }
                                for (let i = 0; i < list_bills.length; i++) {
                                    let lessonsOfBill = [];
                                    for (let j=0; j<list_lessons.length; j++) {
                                        if (String(list_lessons[j].bill) === list_bills[i].id) {
                                            lessonsOfBill.push(list_lessons[j]);
                                        }
                                    }
                                    classifiedGroupedLessons[getGroupedLessonsStateName(list_bills[i].state)]
                                        .push(
                                            {
                                                lessons: lessonsOfBill,
                                                bill: list_bills[i]
                                            });
                                }
                                res.render('lessons_list', {
                                    title: 'Listado de clases',
                                    metaDescription: "",
                                    classifiedGroupedLessons: classifiedGroupedLessons,
                                    user: req.user
                                });
                            });
                    } else {
                        res.render('lessons_list', {
                            title: 'Listado de clases',
                            metaDescription: "",
                            classifiedGroupedLessons: classifiedGroupedLessons,
                            user: req.user
                        });
                    }
                });
        } else {
            Lesson.find({ })
                .populate('teacher student course')
                .exec(function (err, list_lessons) {
                    if (err) { return next(err) }
                    res.render('lessons_list', { title: 'Listado de clases', metaDescription: "", lessons_list: list_lessons, user: req.user })
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
            res.render('lesson_detail', { title: 'Detalle de la clase', metaDescription: "", lesson: result, user: req.user });
        });
};

// Create a lesson GET
exports.create_lesson_get = function (req, res, next) {
    //res.send('Crear clase');
    let week = [];
    let notAvailable = [];
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
            },
            fifth: function (callback) {
                Student.findById( req.user.student, callback );
            }
        }, function (err, results) {
            if (err) { return next(err) }
            for (let i = 0; i< results.third.length; i++){
                if (moment(results.third[i].date).isBetween(moment(firstDay), moment(lastDay), 'day', '[]')) {
                    let day = moment(results.third[i].date).isoWeekday() - 1;
                    let hour = moment(results.third[i].date).hour();
                    notAvailable.push(Math.abs(moment(firstDay).diff(moment(results.third[i].date), 'weeks')) + '' + Number((day*hoursADay)+hour-firstHour));
                }
            }
            res.render('book_lesson',
                {
                    title: 'Reservar clase',
                    teacher: results.first,
                    course: results.second,
                    teacher_user: results.fourth,
                    student: results.fifth,
                    notAvailable: notAvailable,
                    week: week,
                    monthNames: monthNames,
                    displacement: displacement,
                    firstHour: firstHour,
                    hoursADay: hoursADay,
                    metaDescription: "",
                    user: req.user }); //res.render('teacher_detail', { title: 'Detalle de profesor', teacher: results.first, teacher_user: results.second, user: req.user });
        }
    );

};

// Create a lesson POST
exports.create_lesson_post = function (req, res, next) {
    let lessonDates = [];
    let lessonDatesString = req.body.selectedDates.split(',');
    for (let i=0; i<lessonDatesString.length; i++) {
        lessonDates.push(new Date(lessonDatesString[i]));
    }
    let lessons = [];
    let lesson;
    let bill = new Bill(
        {
            state: constants.billPendingState,
            student: req.user.student,
            teacher: req.query.teacherId
        }
    );
    for (let i=0; i< lessonDates.length; i++){
        lesson = new Lesson(
            {
                date: lessonDates[i],
                state: constants.lesson_booked,
                address: req.body.address,
                numberOfStudents: req.body.numberOfStudents,
                student: req.user.student,
                message: req.body.lesson_message,
                teacher: req.query.teacherId,
                course: req.query.courseId,
                bill: bill.id
            }
        );
        lessons.push(lesson);
    }
    let sentence = "Se han solicitado " + lessons.length + " clases, por $" + req.body.totalInput;
    let transaction = new Transaction(
        {
            bill: bill.id,
            description: sentence
        }
    );
    async.parallel({
        /*update_teacher: function (callback) {
            Teacher.findById( lessons[0].teacher, callback)
                .exec(function (err, result) {
                    if (err){ return res.send(err) }
                    for (let i=0; i<lessons.length; i++){
                        result.lessons.push(lessons[i].id);
                    }
                    result.save(function (err) {
                        if (err) { return res.send(err) }
                    })
                });
        },
        /*update_student: function (callback) {
            Student.findById( lessons[0].student, callback)
                .exec(function (err, result) {
                    if (err){return res.send(err)}
                    for (let i=0; i<lessons.length; i++) {
                        result.lessons.push(lessons[i].id);
                    }
                    result.save(function (err) {
                        if (err) { return res.send(err) }
                    })
                });
        },*/
        save_transaction: function (callback) {
            transaction.save(callback);
        },
        save_lesson: function (callback) {
            Lesson.insertMany(lessons, callback, function (err, results) {
                if (err) {
                    res.next(err);
                }
            });
        },
        save_bill: function (callback) {
            bill.save(callback);
        }
    }, function (err, results) {
        if (err) { return next(err) }
        //emailer.notificate_new_class(lesson);
        res.redirect(bill.url);
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
            res.render('edit_lesson', {
                title: 'Reprogramar clase',
                metaDescription: "",
                lesson: results.first,
                notAvailable: notAvailable,
                week: week,
                monthNames: monthNames,
                displacement: displacement,
                user: req.user
            }); //res.render('teacher_detail', { title: 'Detalle de profesor', teacher: results.first, teacher_user: results.second, user: req.user });
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