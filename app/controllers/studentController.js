/**
 * Created by andres on 5/05/17.
 */

let Student = require('../models/student');
let User = require('../models/user');
let constants = require('../../config/constants');
let emailer = require('../../lib/email');
let async = require('async');
let bcrypt = require('bcrypt-nodejs');
let moment = require('moment');

// Display all students GET
exports.student_list = function (req, res, next) {
    //res.send('Lista de estudiantes');
    Student.find({ })
        .exec(function (err, list_students) {
            if (err) { return next(err) }
            res.render('students_list', { title: 'Listado de estudiantes', students_list: list_students, user: req.user })
        });
};

// Display the details of a student GET
exports.student_detail = function (req, res, next) {
    //res.send('Detalle de estudiante ' + req.params.id);
    if (req.isAuthenticated()) {
        async.parallel({
                first: function (callback) {
                    Student.findById(req.params.id, callback);
                },
                second: function (callback) {
                    User.findOne({student: req.params.id}).exec(callback);
                }
            }, function (err, results) {
                if (err) {
                    return next(err)
                }
                res.render('student_detail', {
                    title: 'Detalle de estudiante',
                    student: results.first,
                    student_user: results.second,
                    user: req.user
                });
            }
        );
    } else {
        res.redirect('/login')
    }
};

// Create a student GET
exports.create_student_get = function (req, res, next) {
    //res.send('Crear estudiante');
    res.render('create_student', { title: 'Registrar estudiante', session: req.session });
};

// Create a student POST
exports.create_student_post = function (req, res, next) {
    //res.send('Crear estudiante');
    let student = new Student(
        {   firstName: req.body.firstname,
            lastName: req.body.lastname,
            address: req.body.address,
            phone: req.body.phone,
            birthday: req.body.birthday,
        }
    );
    let hash = bcrypt.hashSync(req.body.new_password);
    let user = new User(
        {
            role: constants.student_role,
            username: req.body.email,
            email: req.body.email,
            password: hash,
            active: { isActive: false, token: student.id },
            owner: student.fullName,
            subscription: Boolean(req.body.subscription),
            student: student.id
        }
    );
    let query;
    async.parallel({
        student_save: function (callback) {
            student.save(callback);
        },
        user_save: function (callback) {
            User.findOne({ 'email': user.email }, callback)
                .exec(function (err, results) {
                    if (err) {
                        return res.send(err)
                    }
                    if (!results) {
                        user.save();
                        query = 'signup=true';
                    } else {
                        if (!results.student && results.teacher){
                            results.student = student.id;
                            results.save();
                            query = 'signup=true';
                        } else {
                            //res.redirect('/login?creationError=true');
                            query = 'creationError=true'
                        }
                    }
                });
        }
    }, function (err, results) {
        if (err) { return next(err) }
        emailer.welcome_student_email(user.email, user.activation_route, student.firstName, user.username);
        res.redirect('/login?'+query);
    });
};

// Delete a student GET
exports.delete_student_get = function (req, res, next) {
    res.send('Eliminar estudiante ' + req.params.id);
};

// Delete a student POST
exports.delete_student_post = function (req, res, next) {
    res.send('Eliminar estudiante ' + req.params.id);
};

// Update a student GET
exports.update_student_get = function (req, res, next) {
    //res.send('Actualizar estudiante ' + req.params.id);
    Student.findById( req.user.student )
        .exec(function (err, result) {
            let birthdayString = moment(result.birthday).utc().format('YYYY-MM-DD');
            res.render('edit_student', { title: 'Editar mi perfil', student: result, birthdayString: birthdayString, user: req.user });
        });
};

// Update a student POST
exports.update_student_post = function (req, res, next) {
    //res.send('Actualizar estudiante ' + req.user.student);
    Student.findOneAndUpdate({_id: req.user.student }, {
        $set: {
            firstName: req.body.firstname,
            lastName: req.body.lastname,
            address: req.body.address,
            phone: req.body.phone,
            birthday: req.body.birthday,
            updatedAt: new Date()
        }
    }, {new: true}, function (err, doc) {
        User.findOneAndUpdate({_id: req.user.id }, {
            $set: {
                owner: doc.fullName
            }
        }, {new:true}, function (err, doc) {

        });
        res.redirect('/home');
    });
};