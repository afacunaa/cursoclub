/**
 * Created by andres on 5/05/17.
 */

let Course = require('../models/course');
let Teacher = require('../models/teacher');
let User = require('../models/user');
let UsageTrack = require('../models/usageTrack');
let uploader = require('../../lib/upload');

// Display all courses GET
exports.course_list = function (req, res, next) {
    //res.send('Lista de cursos');
    if (req.query.search !== undefined) {
        Course.find({ keywords: { $regex: req.query.search, $options: "i" } })
            .exec(function (err, list_courses) {
                if (err) { return next(err) }
                let user;
                if (req.user) {
                    user = req.user.username;
                } else {
                    user = 'Anónimo';
                }
                let usageTrack = UsageTrack(
                    {
                        ipAddress: req.ip,
                        user: user,
                        detail: 'Búsqueda: ' + req.query.search
                    }
                );
                usageTrack.save();
                res.render('courses_list', {
                    title: 'Listado de cursos',
                    metaDescription: "",
                    courses_list: list_courses,
                    query: req.query.name,
                    user: req.user
                });
            });
    } else if (req.query.category !== undefined) {
        let param;
        if (req.query.category === 'Domicilio') {
            param = ['Tiempo libre', 'Académico', 'Entrenamiento físico'];
        } else {
            param = [req.query.category];
        }
        Course.find({ category: { $in: param } })
            .exec(function (err, list_courses) {
                if (err) { return next(err) }
                let user;
                if (req.user) {
                    user = req.user.username;
                } else {
                    user = 'Anónimo';
                }
                let usageTrack = UsageTrack(
                    {
                        ipAddress: req.ip,
                        user: user,
                        detail: 'Por categoría: ' + req.query.category
                    }
                );
                usageTrack.save();
                res.render('courses_list', {
                    title: 'Listado de cursos',
                    metaDescription: "",
                    courses_list: list_courses,
                    query: req.query.category,
                    user: req.user });
            });
    } else {
        if (req.user && req.user.role === 2) {
            Teacher.findById(req.user.teacher).exec(function (err, result) {
                if (err) { return next(err) }
                let coursesId = [];
                for (let i=0; i<result.courses.length; i++) {
                    coursesId.push(result.courses[i].course);
                }
                Course.find({ _id: { $in: coursesId } })
                    .exec(function (err, list_courses) {
                        if (err) { return next(err) }
                        console.log(list_courses);
                        res.render('courses_list', {
                            title: 'Listado de cursos',
                            metaDescription: "",
                            courses_list: list_courses,
                            query: req.query.category,
                            user: req.user });
                    });
            });
        } else {
            Course.find({})
                .exec(function (err, list_courses) {
                    if (err) {
                        return next(err)
                    }
                    res.render('courses_list', {
                        title: 'Listado de cursos',
                        metaDescription: "",
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
    Course.findOne({ idName: req.params.idName }).exec(function (err, course) {
        if (err) { return res.send(err) }
        Teacher.find({ 'courses.course': course.id, 'member.isMember': true })
            .populate('courses.course')
            .exec(function (err, teachers) {
            if (err) { return res.send(err) }
            let teachersId = [];
            let teacherMap = {};
            for (let i=0; i<teachers.length; i++) {
                teachersId.push(teachers[i].id);
                teacherMap[teachers[i].id] = teachers[i];
            }
            User.find({ teacher: { $in: teachersId }, 'active.isActive': true }).exec(function (err, users) {
                if (err) { return res.send(err) }
                let users_list = [];
                for (let i=0; i<users.length; i++) {
                    users[i].teacher = teacherMap[users[i].teacher];
                    users_list.push(users[i]);
                }
                res.render('course_detail',
                    {
                        title: 'Detalle de curso',
                        metaDescription: "",
                        course: course,
                        users_list: users_list,
                        user: req.user
                    });
            })
        })
    });
};

// Create a course GET
exports.create_course_get = function (req, res, next) {
    //res.send('Crear curso');
    res.render('create_course', {title: 'Crear curso', metaDescription: "", user: req.user});

};

// Create a course POST
exports.create_course_post = function (req, res, next) {
    //res.send('Crear curso');
    let course = new Course(
        {   name: req.body.name,
            idName: req.body.idName,
            category: req.body.category,
            description: req.body.description,
            requirement: req.body.requirement,
            keywords: (typeof req.body.keywords==='undefined') ? [] : req.body.keywords.toString().split(','),
        }
    );
    course.save(function (err) {
        if (err) {return next(err) }
        res.redirect(course.url);
    });
};

// Delete a course GET
exports.delete_course_get = function (req, res, next) {
    res.send('Eliminar curso ' + req.params.idName);
};

// Delete a course POST
exports.delete_course_post = function (req, res, next) {
    res.send('Eliminar curso ' + req.params.idName);
};

// Update a course GET
exports.update_course_get = function (req, res, next) {
    //res.send('Actualizar curso ' + req.params.id);
    Course.findOne({ idName: req.params.idName }).exec(function (err, result) {
        if (err) { return next(err) }
        res.render('edit_course', {title: 'Editar curso', metaDescription: "", course: result, user: req.user })
    });
};

// Update a course POST
exports.update_course_post = function (req, res, next) {
    //res.send('Actualizar curso ' + req.params.id);
    Course.findOneAndUpdate({ idName: req.params.idName }, {
        $set:
            {
                name: req.body.name,
                idName: req.body.idName,
                category: req.body.category,
                description: req.body.description,
                requirement: req.body.requirement,
                keywords: (typeof req.body.keywords==='undefined') ? [] : req.body.keywords.toString().split(','),
                externalLink: req.body.externalLink,
                updatedAt: new Date() } },
        { new: true }, function(err, doc) {
        res.redirect(doc.url);
    });
};

//Update course's picture POST
exports.update_course_picture_post = function (req, res, next) {
    uploader.uploadFile(req, 'Course');
    res.redirect('/cursos');
};