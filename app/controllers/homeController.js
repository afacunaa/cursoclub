let User = require('../models/user');
let Lesson = require('../models/lesson');
let BlogEntry = require('../models/blogEntry');
let Teacher = require('../models/teacher');
let Student = require('../models/student');
let Course = require('../models/course');
let constants = require('../../config/constants');
let emailer = require('../../lib/email');
let async = require('async');


exports.index = function (req, res) {
    //console.log("Visitante: "+req.ip);
    let environment;
    if(req.query.env === 'v') {
        environment = 'v'
    } else if (req.query.env === 'n') {
        environment = 'n';
    }
    if (!environment) {
        res.render('welcome', {
            title: 'Curso Club',
            user: req.user,
            environment: environment
        })
    } else {
        async.parallel({
            findBlog: function (callback) {
                BlogEntry.find({}, callback)
                    .sort('-createdAt')
            },
            findCourses: function (callback) {
                let category;
                if (environment === 'v') {
                    category = 'Virtual';
                } else {
                    category = ''
                }
                Course.find({ category: category }, callback)
            }
        }, function (err, results) {
            if (err) { return res.send(err) }
            res.render('index', {
                title: 'Curso Club',
                lastBlogEntry: results.findBlog[0],
                courses_list: results.findCourses,
                user: req.user,
                environment: environment
            })
        });
    }
};

exports.home = function(req, res) {
	if (req.isAuthenticated()) {
		if (req.user.role === constants.student_role) {
		    async.parallel({
                find_student: function (callback) {
                    Student.findById(req.user.student, callback);
                },
                accepted_lessons: function (callback) {
                    Lesson.count({ 'state': constants.lesson_accepted }, callback);
                },
                paid_lessons: function (callback) {
                    Lesson.count({ 'state': constants.lesson_paid }, callback);
                },
                rejected_lessons: function (callback) {
                    Lesson.count({ 'state': constants.lesson_rejected}, callback);
                },
                users: function (callback) {
                    User.find({ 'teacher': { $ne : null} }, callback)
                        .populate( {
                            path: 'teacher',
                            populate: {
                                path: 'courses.course'
                            }
                        } );
                }
            }, function (err, results) {
                if (err) { return res.send(err) }
                res.render('home.ejs', {
                    title: 'Curso Club',
                    error: req.flash("error"),
                    success: req.flash("success"),
                    person: results.find_student,
                    accepted: results.accepted_lessons,
                    paid: results.paid_lessons,
                    rejected: results.rejected_lessons,
                    users_list: results.users,
                    user: req.user
                });
            });
		} else if (req.user.role === constants.teacher_role) {
            async.parallel({
                find_teacher: function (callback) {
                    Teacher.findById(req.user.teacher, callback);
                },
                find_courses: function (callback) {
                    Course.find({ 'teachers': req.user.teacher }, callback);
                },
                booked_lessons: function (callback) {
                    Lesson.count({ 'state': constants.lesson_booked }, callback);
                },
                paid_lessons: function (callback) {
                    Lesson.count({ 'state': constants.lesson_paid }, callback);
                }
            }, function (err, results) {
                if (err) { return res.send(err) }
                res.render('home.ejs', {
                    title: 'Curso Club',
                    error: req.flash("error"),
                    success: req.flash("success"),
                    person: results.find_teacher,
                    courses: results.find_courses,
                    booked: results.booked_lessons,
                    paid: results.paid_lessons,
                    user: req.user
                });
            });
		} else {
            res.render('home.ejs', {
                title: 'Curso Club',
                error: req.flash("error"),
                success: req.flash("success"),
                user: req.user
            });
        }
    } else {
		res.redirect('/login');
	}
	//res.redirect(req.session.user.url)
};

exports.logout = function (req, res) {
	req.logout();
	req.session.destroy();
    res.redirect('/');
};

exports.login = function(req, res) {
	if (req.isAuthenticated()) {
		console.log('Usuario de sesion iniciada');
		res.redirect('/home');
	} else {
        console.log('Usuario no en sesion');
        if (req.query.signup === 'true') {
            res.render('login', {
                title: 'Iniciar sesión',
                error: req.flash("error"),
                success: "Tu cuenta fue creada con éxito. En los proximos minutos debes recibir un " +
					"correo electrónico con tu información de ingreso y un enlace para activar tu cuenta",
                user: req.user
            });
		} else if (req.query.teacherSignup === 'true') {
            res.render('login', {
                title: 'Iniciar sesión',
                error: req.flash("error"),
                success: "Tu registro ha sido exitoso. Revisaremos tu formulario y te avisaremos cuando tu cuenta esté lista",
                user: req.user
            });
        } else if (req.query.creationError === 'true') {
            res.render('login', {
                title: 'Iniciar sesión',
                error: req.flash("error"),
                success: "El correo electrónico ya está en uso en esa modalidad",
                user: req.user
            });
        } else {
            res.render('login', {
                title: 'Iniciar sesión',
                error: req.flash("error"),
                success: req.flash("success"),
                user: req.user
            });
        }
	}
};

exports.contactus_get = function (req, res) {
    res.render('contact', { title: 'Contáctanos', sent: false, user: req.user })
};

exports.contactus_post = function (req, res) {
    emailer.contactus(req.body.firstname, req.body.email, req.body.message);
    res.render('contact', { title: 'Contáctanos', sent: true, user: req.user })
};

exports.aboutus_get = function (req, res) {
    res.render('aboutus', { title: 'Acerca de nosotros', user: req.user })
};