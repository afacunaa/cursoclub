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
let uploader = require('../../lib/upload');
let fs = require('fs');
let log_file = fs.createWriteStream(__dirname + '/instructorio.log', {flags : 'w'});

// Display all teachers GET
exports.teacher_list = function (req, res, next) {
    //res.send('Lista de profesores');
    Teacher.find({ })
        .exec(function (err, list_teacher) {
            if (err) { return next(err) }
            res.render('teachers_list', { title: 'Listado de profesores', metaDescription: "", teachers_list: list_teacher, user: req.user })
        });
};

// Display the details of a teacher GET
exports.teacher_detail = function (req, res, next) {
    //res.send('Detalle de profesor ' + req.params.id);
    if (req.isAuthenticated()) {
        async.parallel({
                first: function (callback) {
                    Teacher.findById(req.params.id, callback).populate('courses.course');
                },
                second: function (callback) {
                    User.findOne({teacher: req.params.id}).exec(callback);
                },
                third: function (callback) {
                    Lesson.find( { teacher: req.params.id}, { student: req.user.id }, callback);
                }
            }, function (err, results) {
                if (err) {
                    return next(err)
                }
                res.render('teacher_detail', {
                    title: 'Detalle de profesor',
                    metaDescription: "",
                    teacher: results.first,
                    teacher_user: results.second,
                    lessons_taken: results.third,
                    user: req.user
                });
            }
        );
    } else {
        res.redirect('/login')
    }
};

// Create a teacher GET
exports.registration_teacher_get = function (req, res, next) {
    //res.send('Crear profesor');
    Course.find({ })
        .exec(function (err, list_courses) {
            if (err) { return next(err) }
            res.render('teacher_registration',
                { title: 'Registro de instructor',
                    metaDescription: "",
                    courses_list: list_courses,
                    user: req.user,
                    error: req.flash("error"),
                    success: req.flash("success"),
                });
        });
};

// Create a teacher POST
exports.registration_teacher_post = function (req, res, next) {
    //res.send('Crear profesor');
    User.findOne( { 'email': req.body.email })
        .exec(function (err, result) {
            if (err) { return next(err) }
            if (result) {
                req.flash('error', 'Ya hay un usuario registrado con esa dirección de correo electrónico');
                res.redirect('/teacher/signup');
            } else {
                let hash = bcrypt.hashSync(req.body.new_password);
                let coursesRaw = (typeof req.body.courses === 'undefined') ? [] : req.body.courses.toString().split(",");
                let coursesId = [];
                for (let i=0; i<coursesRaw.length; i++){
                    let id = coursesRaw[i].substring(0, coursesRaw[i].indexOf(':'));
                    let priceSelector = 'price' + id;
                    let price = req.body[priceSelector];
                    coursesId.push(
                        {
                            course: id,
                            pricePerHour: price
                        });
                }
                let teacher = new Teacher(
                    {
                        firstName: req.body.firstname,
                        lastName: req.body.lastname,
                        phone: req.body.phone,
                        mobile: req.body.mobile,
                        birthday: new Date(req.body.birthday),
                        city: req.body.city,
                        address: req.body.address,
                        document: req.body.document,
                        wantedCourses: req.body.wantedCourse,
                        knowledgeType: (typeof req.body.knowledgeType==='undefined') ? [] : req.body.knowledgeType.toString().split(','),
                        experienceSummary: req.body.experience,
                        kindOfClients: req.body.clients,
                        workingArea: (typeof req.body.workingArea==='undefined') ? [] : req.body.workingArea.toString().split(','),
                        moreAbout: req.body.about,
                        socialNetwork:
                            {
                                facebook: req.body.facebook,
                                linkedin: req.body.linkedin,
                                twitter: req.body.twitter,
                                blog: req.body.blog,
                                website: req.body.website
                            },
                        like: req.body.like,
                        howDidKnow: req.body.howKnew,
                        description: req.body.experience,
                        courses: coursesId,
                        member: {
                            isMember: false,
                            isPremium: false
                        },
                    }
                );
                let user = new User(
                    {
                        role : constants.teacher_role,
                        email: req.body.email,
                        username: req.body.email,
                        password: hash,
                        owner: teacher.shortName,
                        teacher: teacher.id,
                        active : {
                            isActive : false,
                            token : teacher.id
                        },
                        subscription: Boolean(req.body.subscription)
                    }
                );
                log_file.write(new Date() + "\n" + teacher);
                log_file.write(user + "\n----------------------------------------------------------\n");
                async.series({
                    teacher: function (callback) {
                        teacher.save(callback);
                        req.customQuery = teacher.id;
                        uploader.uploadFile(req, 'Teacher');
                    },
                    user: function (callback) {
                        user.save(callback)
                    }
                }, function (err, results) {
                    if (err) {
                        return res.send(err);
                    }
                    req.flash('success', 'Registro exitoso');
                    emailer.welcome_teacher_email(user.email, user.activation_route, teacher.shortName, user.username);
                    res.redirect('/teacher/signup');
                });
            }
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
            res.render('delete_teacher', { title: 'Eliminar profesor', metaDescription: "", teacher: results.first, teacher_courses: results.second, user: req.user })
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
                    .populate('courses.course')
            },
            second: function (callback) {
                Course.find({ /*'teachers': req.params.id*/ }).exec(callback);
            }
        }, function (err, results) {
            if (err) { return next(err) }
            let premiumSinceString = moment(results.first.member.premiumSince).utc().format('YYYY-MM-DD');
            let premiumUntilString = moment(results.first.member.premiumUntil).utc().format('YYYY-MM-DD');
            let teacher_courses_list = [];
            let teacher_courses_list_pricePerHour = [];
            for (let i=0; i<results.first.courses.length; i++){
                teacher_courses_list.push(results.first.courses[i].course.id);
                teacher_courses_list_pricePerHour.push(results.first.courses[i].pricePerHour);
            }
            res.render('edit_teacher',
                {
                    title: 'Editar profesor',
                    metaDescription: "",
                    teacher: results.first,
                    teacher_courses_list: teacher_courses_list,
                    teacher_courses_list_pricePerHour: teacher_courses_list_pricePerHour,
                    courses_list: results.second,
                    premiumSinceString: premiumSinceString,
                    premiumUntilString: premiumUntilString,
                    error: req.flash("error"),
                    success: req.flash("success"),
                    user: req.user
                })
        }
    );
};

// Update a teacher POST
exports.update_teacher_post = function (req, res, next) {
    //res.send('Actualizar profesor ' + req.params.id);
    let courses = [];
    let courseWithPrice = {};
    let isMember = Boolean(req.body.isMember);
    let isPremium = Boolean(req.body.isPremium);
    let coursesId = (typeof req.body.course==='undefined') ? [] : req.body.course.toString().split(",");
    for (let i=0; i < coursesId.length; i++){
        courseWithPrice = {
            course: coursesId[i],
            pricePerHour: req.body['course_price'+coursesId[i]]
        };
        courses.push(courseWithPrice);
    }
    // First, update all courses' teachers list adding teacher's ID and then save the new created teacher
    async.series({
        clean_courses: function (callback) {
            Course.find({ 'teachers': req.params.id }, callback)
                .exec(function (err, result) {
                    for (let i=0; i<result.length; i++){
                        let index = result[i].teachers.indexOf(req.params.id);
                        result[i].teachers.splice(index, 1);
                        result[i].save();
                    }
                });
        },
        course_update: function (callback) {
            Course.find({ _id: { $in: coursesId }}, callback)
                .exec(function (err, result) {
                    if (err){return res.send(err)}
                    for (let i=0; i<result.length; i++){
                        result[i].teachers.push(req.params.id);
                        result[i].save();
                    }
                });
        },
        teacher_update: function (callback) {
            Teacher.findById(req.params.id, callback)
                .exec(function (err, result) {
                    if (err) {
                        return res.send(err)
                    }
                    result.firstName = req.body.firstname;
                    result.lastName = req.body.lastname;
                    result.description = req.body.description;
                    result.city = req.body.city;
                    result.phone = req.body.phone;
                    result.workingArea = (typeof req.body.workingArea === 'undefined') ? [] : req.body.workingArea.toString().split(',');
                    result.courses = courses;
                    if (req.user.role === constants.admin_role) {
                        result.member = {
                            isMember: isMember,
                            isPremium: isPremium,
                            premiumSince: req.body.premiumSince,
                            premiumUntil: req.body.premiumUntil
                        };
                    }
                    result.updatedAt = new Date();
                    result.save(function (err) {
                        if (err) { return res.send(err) }
                        User.findOne({'teacher': req.params.id }, function (err, doc) {
                            if (err) { return res.send(err) }
                            doc.owner = result.shortName;
                            doc.updatedAt = new Date();
                            doc.save();
                        })
                    });
                });
            /*Teacher.findOneAndUpdate({_id: req.params.id }, {
                $set: {
                    firstName: req.body.firstname,
                    lastName: req.body.lastname,
                    document: req.body.document,
                    description: req.body.description,
                    city: req.body.city,
                    phone: req.body.phone,
                    workingArea: (typeof req.body.workingArea==='undefined') ? [] : req.body.workingArea.toString().split(','),
                    courses: courses,
                    member: {
                        isMember: isMember,
                        isPremium: isPremium,
                        premiumSince: req.body.premiumSince,
                        premiumUntil: req.body.premiumUntil
                    },
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
            }, callback); */
        }
    }, function (err, results) {
        if (err) { return next(err) }
        req.flash('success', 'Cambios hechos correctamente');
        res.redirect('/teacher/' + req.params.id + '/update');
    })
};

exports.update_teacher_schedule_get = function (req, res, next) {
    let hoursADay = constants.hoursADay;
    Teacher.findById( req.user.teacher )
        .exec(function (err, result) {
            res.render('edit_schedule', { title: 'Editar mi horario', metaDescription: "", teacher: result, hoursADay: hoursADay, user: req.user });
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