let express = require('express');
let blogEntryController = require('../app/controllers/blogEntryController');
let homeController = require('../app/controllers/homeController');
let courseController = require('../app/controllers/courseController');
let lessonController = require('../app/controllers/lessonController');
let paymentController = require('../app/controllers/paymentController');
let studentController = require('../app/controllers/studentController');
let teacherController = require('../app/controllers/teacherController');
let transactionController = require('../app/controllers/transactionController');
let userController = require('../app/controllers/userController');
let router = express.Router();
let passport = require('passport');
let multer = require('multer');

//you can include all your controllers
/*
module.exports = function (app, passport) {

    app.get('/login', homeController.login);
    app.get('/signup', homeController.signup);

    app.get('/', homeController.loggedIn, homeController.home);//home
    app.get('/home', homeController.loggedIn, homeController.home);//home

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/home', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));
    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/home', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));
};*/

/* Predefined routes */

router.get('/', homeController.index);
router.get('/login', homeController.login);
router.get('/home', homeController.home);//home
router.get('/contactus', homeController.contactus_get);
router.post('/contactus', homeController.contactus_post);
router.get('/logout', homeController.logout);
router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/login', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}));


/* Facebook routes */

// Send user to Facebook
router.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

// Facebook sends back user information
router.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/login',
    failureRedirect: '/login'
}));


/* Course routes */

// GET course creation
router.get('/course/create', courseController.create_course_get);

// POST course creation
router.post('/course/create', courseController.create_course_post);

// GET course update
router.get('/course/:id/update', courseController.update_course_get);

// POST course update
router.post('/course/:id/update', courseController.update_course_post);

// POST course's picture update
router.post('/course/:id/uploadPicture', courseController.update_course_picture_post);

// GET course deletion
router.get('/course/:id/delete', courseController.delete_course_get);

// POST course deletion
router.post('/course/:id/delete', courseController.delete_course_post);

// GET course list
router.get('/courses', courseController.course_list);

// GET course detail
router.get('/course/:id', courseController.course_detail);


/* Lesson routes */

// GET lesson creation
router.get('/lesson/create', lessonController.create_lesson_get);

// POST lesson creation
router.post('/lesson/create', lessonController.create_lesson_post);

// GET lesson update
router.get('/lesson/:id/update', lessonController.update_lesson_get);

// POST lesson update
router.post('/lesson/:id/update', lessonController.update_lesson_post);

// POST lesson update state
router.post('/lesson/:id/stateUpdate', lessonController.update_lesson_state_post);

// GET lesson deletion
router.get('/lesson/:id/delete', lessonController.delete_lesson_get);

// POST lesson deletion
router.post('/lesson/:id/delete', lessonController.delete_lesson_post);

// GET lesson list
router.get('/lessons', lessonController.lesson_list);

// GET lesson detail
router.get('/lesson/:id', lessonController.lesson_detail);


/* Payment routes */

// GET payment creation
router.get('/payment/create', paymentController.create_payment_get);

// POST payment creation
router.post('/payment/create', paymentController.create_payment_post);

// GET payment update
router.get('/payment/:id/update', paymentController.update_payment_get);

// POST payment update
router.post('/payment/:id/update', paymentController.update_payment_post);

// GET payment deletion
router.get('/payment/:id/delete', paymentController.delete_payment_get);

// POST payment deletion
router.post('/payment/:id/delete', paymentController.delete_payment_post);

// GET payment list
router.get('/payments', paymentController.payment_list);

// GET payment detail
router.get('/payment/:id', paymentController.payment_detail);


/* Student routes */

// GET student creation
router.get('/student/create', studentController.create_student_get);

// POST student creation
router.post('/student/create', studentController.create_student_post);

// GET student update
router.get('/student/update', studentController.update_student_get);

// POST student update
router.post('/student/update', studentController.update_student_post);

// GET student deletion
router.get('/student/:id/delete', studentController.delete_student_get);

// POST student deletion
router.post('/student/:id/delete', studentController.delete_student_post);

// GET student list
router.get('/students', studentController.student_list);

// GET student detail
router.get('/student/:id', studentController.student_detail);


/* Teacher routes */

// GET teacher creation
router.get('/teacher/create', teacherController.create_teacher_get);

// POST teacher creation
router.post('/teacher/create', teacherController.create_teacher_post);

// GET teacher update
router.get('/teacher/:id/update', teacherController.update_teacher_get);

// POST teacher update
router.post('/teacher/:id/update', teacherController.update_teacher_post);

// POST teacher update schedule
router.get('/teacher/:id/scheduleUpdate', teacherController.update_teacher_schedule_get);

// POST teacher update schedule
router.post('/teacher/:id/scheduleUpdate', teacherController.update_teacher_schedule_post);

// GET teacher deletion
router.get('/teacher/:id/delete', teacherController.delete_teacher_get);

// POST teacher deletion
router.post('/teacher/:id/delete', teacherController.delete_teacher_post);

// GET teacher list
router.get('/teachers', teacherController.teacher_list);

// GET teacher detail
router.get('/teacher/:id', teacherController.teacher_detail);


/* User routes */

// GET teacher update
router.get('/user/update', userController.update_user_get);

// POST teacher update
router.post('/user/update', userController.update_user_post);

// POST user's picture update
router.post('/user/:id/uploadPicture', userController.update_user_picture_post);

// GET activate user
router.get('/user/:id/activate/:token', userController.activate_user_get);


/* Transaction routes */

// GET transaction creation
router.get('/transaction/create', transactionController.create_transaction_get);

// POST transaction creation
router.post('/transaction/create', transactionController.create_transaction_post);

// GET transaction update
router.get('/transaction/:id/update', transactionController.update_transaction_get);

// POST transaction update
router.post('/transaction/:id/update', transactionController.update_transaction_post);

// GET transaction deletion
router.get('/transaction/:id/delete', transactionController.delete_transaction_get);

// POST transaction deletion
router.post('/transaction/:id/delete', transactionController.delete_transaction_post);

// GET transaction list
router.get('/transactions', transactionController.transaction_list);

// GET transaction detail
router.get('/transaction/:id', transactionController.transaction_detail);


/* BlogEntry routes */

// GET BlogEntry creation
router.get('/blog/create', blogEntryController.create_blogEntry_get);

// POST BlogEntry creation
router.post('/blog/create', blogEntryController.create_blogEntry_post);

// GET BlogEntry update
router.get('/blog/:id/update', blogEntryController.update_blogEntry_get);

// POST BlogEntry update
router.post('/blog/:id/update', blogEntryController.update_blogEntry_post);

// GET BlogEntry deletion
router.get('/blog/:id/delete', blogEntryController.delete_blogEntry_get);

// POST BlogEntry deletion
router.post('/blog/:id/delete', blogEntryController.delete_blogEntry_post);

// GET BlogEntry list
router.get('/blogs', blogEntryController.blogEntry_list);

// GET BlogEntry detail
router.get('/blog/:id', blogEntryController.blogEntry_detail_get);

// POST BlogEntry detail
router.post('/blog/:id', blogEntryController.blogEntry_detail_post);


module.exports = router;