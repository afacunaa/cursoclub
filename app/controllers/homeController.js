let User = require('../models/user');
let Lesson = require('../models/lesson');
let BlogEntry = require('../models/blogEntry');
let Teacher = require('../models/teacher');
let Student = require('../models/student');
let constants = require('../../config/constants');
let emailer = require('../../lib/email');
let async = require('async');


exports.index = function (req, res) {
    console.log("Visitante: "+req.ip);
    BlogEntry.find({})
        .sort('-createdAt')
        .exec(function (err, results) {
            if (err) { return res.send(res) }
            res.render('index', { title: 'Curso Club', lastBlogEntry: results[0], user: req.user })
        });
};

exports.home = function(req, res) {
	if (req.isAuthenticated()) {
		if (req.user.role === constants.student_role) {
			Student.findById( req.user.student )
				.populate('lessons')
				.exec(function (err, result) {
					if (err) { return res.send(err) }
					res.render('home.ejs', {
						title: 'Curso Club',
						error: req.flash("error"),
						success: req.flash("success"),
						person: result,
						user: req.user
					});
				});
		} else if (req.user.role === constants.teacher_role) {
            Teacher.findById( req.user.teacher )
                .populate('lessons courses.course')
                .exec(function (err, result) {
                    if (err) { return res.send(err) }
                    res.render('home.ejs', {
                        title: 'Curso Club',
                        error: req.flash("error"),
                        success: req.flash("success"),
                        person: result,
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
        if (req.query.signup === 'true'){
            res.render('login', {
                title: 'Iniciar sesión',
                error: req.flash("error"),
                success: "Tu cuenta fue creada con éxito. En los proximos minutos debes recibir un " +
					"correo electrónico con tu información de ingreso y un enlace para activar tu cuenta",
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