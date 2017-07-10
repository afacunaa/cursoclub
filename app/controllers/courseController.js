/**
 * Created by andres on 5/05/17.
 */

let Course = require('../models/course');
let async = require('async');
let multer = require('multer');

// Display all courses GET
exports.course_list = function (req, res, next) {
    //res.send('Lista de cursos');
    if (req.query.name !== undefined){
        let name = req.query.name;
        name = name.replace(/[aá]/g, '[aá]');
        name = name.replace(/[eé]/g, '[eé]');
        name = name.replace(/[ií]/g, '[ií]');
        name = name.replace(/[oó]/g, '[oó]');
        name = name.replace(/[uúü]/g, '[uúü]');
        Course.find({ name: new RegExp(name, 'i') })
            .populate('teachers')
            .exec(function (err, list_courses) {
                if (err) { return next(err) }
                res.render('courses_list', { title: 'Listado de cursos', courses_list: list_courses, query:req.query.name, user: req.user });
            });
    } else if (req.query.category !== undefined){
        Course.find({ category: req.query.category })
            .populate('teachers')
            .exec(function (err, list_courses) {
                if (err) { return next(err) }
                res.render('courses_list', { title: 'Listado de cursos', courses_list: list_courses, query:req.query.category, user: req.user });
            });
    } else {
        if (req.user && req.user.role === 2) {
            /*let user_teacher;
            async.series({
                    first: function (callback) {
                        Teacher.findById( user.teacher, callback ).exec(function (err, teacher) {
                            if (err) {return err}
                            user_teacher = teacher;
                        });
                    },
                    second: function (callback) {
                        Course.find({ 'teachers': user_teacher }).exec(callback);
                    }
                }, function (err, results) {
                    if (err) { return next(err) }
                    res.render('delete_teacher', { title: 'Eliminar profesor', teacher: results.first, teacher_courses: results.second, user: req.user })
                }
            );*/
            Course.find({ 'teachers': req.user.teacher })
                .exec(function (err, list_courses) {
                    if (err) { return next(err) }
                    res.render('courses_list', { title: 'Listado de cursos', courses_list: list_courses, query:req.query.category, user: req.user });
                });
        } else {
            Course.find({})
                .populate('teachers')
                .exec(function (err, list_courses) {
                    if (err) {
                        return next(err)
                    }
                    res.render('courses_list', {
                        title: 'Listado de cursos',
                        courses_list: list_courses,
                        query: req.query.name,
                        user: req.user
                    });
                });
        }
    }
};

// Display the details of a course GET
exports.course_detail = function (req, res, next) {
    //res.send('Detalle de curso ' + req.params.id);
    Course.findOne({ _id: req.params.id })
        .populate('teachers')
        .exec(function (err, result) {
            res.render('course_detail', { title: 'Detalle de curso', course: result, user: req.user });
        });
};

// Create a course GET
exports.create_course_get = function (req, res, next) {
    //res.send('Crear curso');
    res.render('create_course', {title: 'Crear curso', user: req.user});

};

// Create a course POST
exports.create_course_post = function (req, res, next) {
    //res.send('Crear curso');
    let course = new Course(
        {   name: req.body.name,
            category: req.body.category,
            description: req.body.description,
            requirement: req.body.requirement   }
    );
    course.save(function (err) {
        if (err) {return next(err) }
        res.redirect(course.url);
    });
};

// Delete a course GET
exports.delete_course_get = function (req, res, next) {
    res.send('Eliminar curso ' + req.params.id);
};

// Delete a course POST
exports.delete_course_post = function (req, res, next) {
    res.send('Eliminar curso ' + req.params.id);
};

// Update a course GET
exports.update_course_get = function (req, res, next) {
    //res.send('Actualizar curso ' + req.params.id);
    Course.findById(req.params.id).exec(function (err, result) {
        if (err) { return next(err) }
        res.render('edit_course', {title: 'Editar curso', course: result, user: req.user })
    });
};

// Update a course POST
exports.update_course_post = function (req, res, next) {
    //res.send('Actualizar curso ' + req.params.id);
    Course.findOneAndUpdate({ _id: req.params.id }, { $set: { name: req.body.name, category: req.body.category, description: req.body.description, requirement: req.body.requirement, updatedAt: new Date() } }, { new: true }, function(err, doc) {
        res.redirect(doc.url);
    });
};

//Update course's picture POST
exports.update_course_picture_post = function (req, res, next) {
    Course.findOneAndUpdate({ _id: req.params.id }, { $set: { picture: '/uploads/'+req.file.filename } }, { new: true }, function(err, doc) {
        if (err) { return next(err) }
        res.redirect('/course/' + doc.id);
    });
};