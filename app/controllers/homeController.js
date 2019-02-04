let User = require('../models/user');
let Lesson = require('../models/lesson');
let BlogEntry = require('../models/blogEntry');
let Teacher = require('../models/teacher');
let Student = require('../models/student');
let Course = require('../models/course');
let Conversation = require('../models/conversation');
let constants = require('../../config/constants');
let emailer = require('../../lib/email');
let async = require('async');


exports.index = function (req, res) {
    //console.log("Visitante: "+req.ip);
    let environment;
    if(req.query.env === 'v') {
        environment = 'v'
    } else if (req.query.env === 'i') {
        environment = 'i';
    } else if (req.query.env === 'n') {
        environment = 'n';
    }
    if (!environment) {
        BlogEntry.find({})
            .sort('-createdAt')
            .limit(6)
            .exec(function (err, list_blogEntry) {
                if (err) {
                    return next(err)
                }
                res.render('welcome', {
                    title: 'Instructorio',
                    metaDescription: "",
                    user: req.user,
                    environment: environment,
                    blogEntry_list: list_blogEntry,
                });
            });
    } else {
        async.parallel({
            users: function (callback) {
                User.find({ 'teacher': { $ne : null}, 'active.isActive': true }, callback)
                    .populate( {
                        path: 'teacher',
                        populate: {
                            path: 'courses.course'
                        }
                    } );
            },
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
                title: 'Instructorio',
                metaDescription: "",
                lastBlogEntry: results.findBlog[0],
                courses_list: results.findCourses,
                users_list: results.users,
                user: req.user,
                environment: environment
            })
        });
    }
};

exports.home = function(req, res) {
	if (req.isAuthenticated()) {
        let environment;
        if(req.query.env === 'v') {
            environment = 'v'
        } else if (req.query.env === 'i') {
            environment = 'i';
        } else {
            environment = 'n';
        }
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
                    User.find({ 'teacher': { $ne : null}, 'active.isActive': true }, callback)
                        .populate( {
                            path: 'teacher',
                            populate: {
                                path: 'courses.course'
                            }
                        } );
                },
                unread_messages: function (callback) {
                    Conversation.find({$or: [{'user1.user': req.user.id, 'user1.unread': true}, {'user2.user': req.user.id, 'user2.unread': true}]} , callback)
                }
            }, function (err, results) {
                if (err) { return res.send(err) }
                res.render('home.ejs', {
                    title: 'Instructorio',
                    metaDescription: "",
                    error: req.flash("error"),
                    success: req.flash("success"),
                    person: results.find_student,
                    accepted: results.accepted_lessons,
                    paid: results.paid_lessons,
                    rejected: results.rejected_lessons,
                    users_list: results.users,
                    user: req.user,
                    unread: results.unread_messages,
                    environment: environment
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
                accepted_lessons: function (callback) {
                    Lesson.count({ 'state': constants.lesson_accepted }, callback);
                },
                unread_messages: function (callback) {
                    Conversation.find({$or: [
                        {'user1.user': req.user.id, 'user1.unread': true},
                        {'user2.user': req.user.id, 'user2.unread': true}
                        ]} , callback)
                }
            }, function (err, results) {
                if (err) { return res.send(err) }
                res.render('home.ejs', {
                    title: 'Instructorio',
                    metaDescription: "",
                    error: req.flash("error"),
                    success: req.flash("success"),
                    person: results.find_teacher,
                    courses: results.find_courses,
                    booked: results.booked_lessons,
                    accepted: results.accepted_lessons,
                    unread: results.unread_messages,
                    user: req.user
                });
            });
		} else {
            res.render('home.ejs', {
                title: 'Instructorio',
                metaDescription: "",
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

exports.landing = function(req, res) {
    res.render('landing', {
        title: 'Instructorio',
        metaDescription: "",
        error: req.flash("error"),
        success: req.flash("success"),
        user: req.user
        });
};

exports.login = function(req, res) {

	if (req.isAuthenticated()) {
		res.redirect('/home');
	} else {
        res.render('login', {
            title: 'Iniciar sesión',
            metaDescription: "",
            error: req.flash("error"),
            success: req.flash("success"),
            user: req.user
        });
    }
};

exports.signup = function(req, res) {
    if (req.isAuthenticated()) {
        res.redirect('/home');
    } else {
        res.render('signup', {
            title: 'Registrarse',
            metaDescription: "",
            error: req.flash("error"),
            success: req.flash("success"),
            user: req.user
        });
    }
};

exports.contactus_get = function (req, res) {
    res.render('contact', { title: 'Contáctanos', metaDescription: "", sent: false, user: req.user })
};

exports.terms_get = function (req, res) {
    let target = req.query.target;
    res.render('terms_and_conditions', { title: 'Términos y condiciones', metaDescription: "", user: req.user, target: target })
};

exports.contactus_post = function (req, res) {
    emailer.contactus(req.body.firstname, req.body.email, req.body.message);
    res.render('contact', { title: 'Contáctanos', metaDescription: "", sent: true, user: req.user })
};

exports.aboutus_get = function (req, res) {
    res.render('aboutus', { title: 'Sobre nosotros', metaDescription: "", user: req.user })
};

exports.help_get = function (req, res) {
    res.render('help', { title: 'Sección de ayuda', metaDescription: "", user: req.user })
};