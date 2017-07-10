/**
 * Created by andres on 5/05/17.
 */

let constants = require('../../config/constants');
let User = require('../models/user');
let Teacher = require('../models/teacher');
let Course = require('../models/course');
let Lesson = require('../models/lesson');
let emailer = require('../../lib/email');
let async = require('async');
let bcrypt = require('bcrypt-nodejs');
let moment = require('moment');

// Display all teachers GET
exports.teacher_list = function (req, res, next) {
    //res.send('Lista de profesores');
    Teacher.find({ })
        .exec(function (err, list_teacher) {
            if (err) { return next(err) }
            res.render('teachers_list', { title: 'Listado de profesores', teachers_list: list_teacher, user: req.user })
        });
};

// Display the details of a teacher GET
exports.teacher_detail = function (req, res, next) {
    //res.send('Detalle de profesor ' + req.params.id);
    /*Teacher.findById( req.params.id )
     .populate('courses')
     .exec(function (err, result) {
     res.render('teacher_detail', { title: 'Detalle de profesor', teacher: result, user: req.user });
     });*/
    if (req.isAuthenticated()) {
        async.parallel({
                first: function (callback) {
                    Teacher.findById(req.params.id, callback).populate('courses');
                },
                second: function (callback) {
                    User.findOne({teacher: req.params.id}).exec(callback);
                }
            }, function (err, results) {
                if (err) {
                    return next(err)
                }
                res.render('teacher_detail', {
                    title: 'Detalle de profesor',
                    teacher: results.first,
                    teacher_user: results.second,
                    user: req.user
                });
            }
        );
    } else {
        res.redirect('/login')
    }
};

// Create a teacher GET
exports.create_teacher_get = function (req, res, next) {
    //res.send('Crear profesor');
    Course.find({ })
        .exec(function (err, list_courses) {
            if (err) { return next(err) }
            res.render('create_teacher', { title: 'Crear profesor', courses_list: list_courses, user: req.user });
        });
};

// Create a teacher POST
exports.create_teacher_post = function (req, res, next) {
    //res.send('Crear profesor');
    let hash = bcrypt.hashSync(req.body.document);
    let teacher = new Teacher(
        {   firstName: req.body.firstname,
            lastName: req.body.lastname,
            document: req.body.document,
            pricePerHour: '',
            birthday: req.body.birthday,
            address: req.body.address,
            phone: req.body.phone,
            courses: (typeof req.body.course==='undefined') ? [] : req.body.course.toString().split(",")  }
    );
    let user = new User(
        {   role: constants.teacher_role,
            email: req.body.email,
            username: req.body.email,
            password: hash,
            active: { isActive: false, token: teacher.id },
            owner: teacher.fullName,
            teacher: teacher.id }
    );
    let prices = teacher.pricePerHour;
    let username;
    for (let i = 0; i < teacher.courses.length; i++){
        //console.log('Precios seleccionados: '+req.body['price'+teacher.courses[i]]);
        text = '<'+teacher.courses[i]+':'+req.body['price'+teacher.courses[i]]+'>';
        prices = prices.concat('/',text);
    }
    teacher.pricePerHour = prices;
    // First, update all courses' teachers list adding teacher's ID and then save the new created teacher
    async.series({
        course_save: function (callback) {
            Course.find({ _id: { $in: teacher.courses }}, callback)
                .exec(function (err, result) {
                    if (err){return res.send(err)}
                    for (let i=0; i<result.length; i++){
                        result[i].teachers.push(teacher.id);
                        result[i].save(function (err) {
                            if (err) { return res.send(err) }
                        })
                    }
                });
        },
        teacher_save: function (callback) {
            teacher.save(callback);
        },
        user_save: function (callback) {
            username = user.email.substring(0, user.email.indexOf('@'));
            User.find({ 'username': new RegExp(username, 'i') }, callback)
                .exec(function (err, results) {
                    if (results.length > 0) {
                        username += results.length;
                    }
                    user.username = username;
                    user.save(function (err) {
                        if (err) { return res.send(err) }
                    });
                });
        }
    }, function (err, results) {
        if (err) { return next(err) }
        emailer.welcome_teacher_email(user.email, user.activation_route, teacher.firstName, username);
        res.redirect(teacher.url);
    });
};

// Delete a teacher GET
exports.delete_teacher_get = function (req, res, next) {
    //res.send('Eliminar profesor ' + req.params.id);
    async.parallel({
            first: function (callback) {
                Teacher.findById( req.params.id ).exec(callback);
            },
            second: function (callback) {
                Course.find({ 'teachers': req.params.id }).exec(callback);
            }
        }, function (err, results) {
            if (err) { return next(err) }
            res.render('delete_teacher', { title: 'Eliminar profesor', teacher: results.first, teacher_courses: results.second, user: req.user })
        }
    );
};

// Delete a teacher POST
exports.delete_teacher_post = function (req, res, next) {
    //res.send('Eliminar profesor ' + req.params.id);
    async.series({
            first: function (callback) {
                User.findOneAndRemove( { 'teacher': req.params.id }, callback );
            },
            second: function (callback) {
                Teacher.findByIdAndRemove( req.params.id, callback)
            },
            third: function (callback) {
                Course.find({ 'teachers': req.params.id }, callback)
                    .exec(function (err, result) {
                        for (let i=0; i<result.length; i++){
                            let index = result[i].teachers.indexOf(req.params.id);
                            result[i].teachers.splice(index, 1);
                            result[i].save(function (err) {
                                if (err) { return res.send(err) }
                            });
                        }
                    });
            }
        }, function (err, results) {
            if (err) { return next(err) }
            res.redirect('/teachers');
        }
    );
};

// Update a teacher GET
exports.update_teacher_get = function (req, res, next) {
    //res.send('Actualizar profesor ' + req.params.id);
    async.parallel({
            first: function (callback) {
                Teacher.findById( req.params.id, callback )
            },
            second: function (callback) {
                Course.find({ /*'teachers': req.params.id*/ }).exec(callback);
            }
        }, function (err, results) {
            if (err) { return next(err) }
            let birthdayString = moment(results.first.birthday).utc().format('YYYY-MM-DD');
            res.render('edit_teacher', { title: 'Editar profesor', teacher: results.first, courses_list: results.second, birthdayString: birthdayString, user: req.user })
        }
    );
};

// Update a teacher POST
exports.update_teacher_post = function (req, res, next) {
    //res.send('Actualizar profesor ' + req.params.id);
    /*let teacher = new Teacher(
        {   _id: req.params.id,
            firstName: req.body.firstname,
            lastName: req.body.lastname,
            document: req.body.document,
            birthday: req.body.birthday,
            description: req.body.description,
            address: req.body.address,
            phone: req.body.phone,
            courses: (typeof req.body.course==='undefined') ? [] : req.body.course.toString().split(","),
            schedule: (typeof req.body.schedule==='undefined') ? [] : req.body.schedule.toString().split(",")
        }
    );*/
    let courses = (typeof req.body.course==='undefined') ? [] : req.body.course.toString().split(",");
    // Different update for User
    let prices = '';
    for (let i = 0; i < courses.length; i++){
        //console.log('Precios seleccionados: '+req.body['price'+teacher.courses[i]]);
        text = '<'+courses[i]+':'+req.body['price'+courses[i]]+'>';
        prices = prices.concat('/', text);
    }
    // First, update all courses' teachers list adding teacher's ID and then save the new created teacher
    async.series({
        clean_courses: function (callback) {
            Course.find({ 'teachers': req.params.id }, callback)
                .exec(function (err, result) {
                    for (let i=0; i<result.length; i++){
                        let index = result[i].teachers.indexOf(req.params.id);
                        result[i].teachers.splice(index, 1);
                        result[i].save(function (err) {
                            if (err) { return res.send(err) }
                        });
                    }
                });
        },
        course_update: function (callback) {
            Course.find({ _id: { $in: courses }}, callback)
                .exec(function (err, result) {
                    if (err){return res.send(err)}
                    for (let i=0; i<result.length; i++){
                        result[i].teachers.push(req.params.id);
                        result[i].save(function (err) {
                            if (err) { return res.send(err) }
                        })
                    }
                });
        },
        /*user_owner_update: function (callback) {
            User.findOneAndUpdate({ 'teacher': req.params.id }, {
                $set: {
                    owner: teacher.fullName
                }
            }, callback)
        },
        teacher_update: function (callback) {
            Teacher.findByIdAndUpdate(req.params.id, teacher, callback);
        },*/
        teacher_update: function (callback) {
            Teacher.findOneAndUpdate({_id: req.params.id }, {
                $set: {
                    firstName: req.body.firstname,
                    lastName: req.body.lastname,
                    document: req.body.document,
                    birthday: req.body.birthday,
                    description: req.body.description,
                    address: req.body.address,
                    phone: req.body.phone,
                    pricePerHour: prices,
                    courses: (typeof req.body.course==='undefined') ? [] : req.body.course.toString().split(","),
                    updatedAt: new Date()
                }
            }, {new: true}, function (err, doc) {
                User.findOneAndUpdate({'teacher': req.params.id }, {
                    $set: {
                        owner: doc.fullName,
                        updatedAt: new Date()
                    }
                }, {new:true}, function (err, doc) {
                    res.redirect('/home');
                }, callback);
            }, callback);
        }
    }, function (err, results) {
        if (err) { return next(err) }

    })
};

exports.update_teacher_schedule_get = function (req, res, next) {
    Teacher.findById( req.user.teacher )
        .exec(function (err, result) {
            res.render('edit_schedule', { title: 'Editar mi horario', teacher: result, user: req.user });
        });
};

exports.update_teacher_schedule_post = function (req, res, next) {
    let schedule = [];
    try {
        for (let i = 0; i < req.body.schedule.length; i++) {
            schedule.push(Number(req.body.schedule[i]));
        }
    } catch (err) { }
    Teacher.findOneAndUpdate({ _id: req.user.teacher }, { $set: { schedule: schedule } }, { new: true }, function(err, doc) {

    });
    /*async.series({
        find_teacher: function (callback) {
            Teacher.findById(user.teacher, callback)
                .exec(function (err, result) {
                    if (err){ return res.send(err) }
                    result.schedule = schedule;
                    result
                })
        }
    });*/
    res.redirect('/home');
};