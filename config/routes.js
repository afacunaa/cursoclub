let express = require('express');
let billController = require('../app/controllers/billController');
let blogEntryController = require('../app/controllers/blogEntryController');
let courseController = require('../app/controllers/courseController');
let conversationController = require('../app/controllers/conversationController');
let emailMessageController = require('../app/controllers/emailMessageController');
let homeController = require('../app/controllers/homeController');
let lessonController = require('../app/controllers/lessonController');
let paymentController = require('../app/controllers/paymentController');
let studentController = require('../app/controllers/studentController');
let teacherController = require('../app/controllers/teacherController');
let transactionController = require('../app/controllers/transactionController');
let usageTrackController = require('../app/controllers/usageTrackController');
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
router.get('/signup', homeController.signup);
router.get('/registro', homeController.landing);
router.post('/registro', homeController.landing_post);
router.get('/registro-curso-virtual', homeController.landing_virtual);
router.post('/registro-curso-virtual', homeController.landing_virtual_post);
router.get('/home', homeController.home);//home
router.get('/contactenos', homeController.contactus_get);
router.get('/nosotros', homeController.aboutus_get);
router.get('/terminos', homeController.terms_get);
router.post('/contactenos', homeController.contactus_post);
router.get('/ayuda', homeController.help_get);
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
router.get('/curso/create', courseController.create_course_get);

// POST course creation
router.post('/curso/create', courseController.create_course_post);

// GET course update
router.get('/curso/:idName/update', courseController.update_course_get);

// POST course update
router.post('/curso/:idName/update', courseController.update_course_post);

// POST course's picture update
router.post('/curso/:idName/uploadPicture', courseController.update_course_picture_post);

// GET course deletion
router.get('/curso/:idName/delete', courseController.delete_course_get);

// POST course deletion
router.post('/curso/:idName/delete', courseController.delete_course_post);

// GET course list
router.get('/cursos', courseController.course_list);

// GET course detail
router.get('/curso/:category/:idName', courseController.course_detail);


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

// GET teacher registration
router.get('/teacher/signup', teacherController.registration_teacher_get);

// POST teacher creation second part
router.post('/teacher/signup', teacherController.registration_teacher_post);

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

// GET user update
router.get('/user/update', userController.update_user_get);

// POST user update
router.post('/user/update', userController.update_user_post);

// GET uset recovery
router.get('/user/recovery', userController.recovery_user_get);

// POST user recovery
router.post('/user/recovery', userController.recovery_user_post);

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
router.get('/blog/:idTitle/update', blogEntryController.update_blogEntry_get);

// POST BlogEntry update
router.post('/blog/:idTitle/update', blogEntryController.update_blogEntry_post);

// POST BlogEntry's picture update
router.post('/blog/:idTitle/uploadPicture', blogEntryController.update_blogEntry_picture_post);

// GET BlogEntry deletion
router.get('/blog/:idTitle/delete', blogEntryController.delete_blogEntry_get);

// POST BlogEntry deletion
router.post('/blog/:idTitle/delete', blogEntryController.delete_blogEntry_post);

// GET BlogEntry list
router.get('/blog', blogEntryController.blogEntry_list);

// GET BlogEntry detail
router.get('/blog/:idTitle', blogEntryController.blogEntry_detail_get);

// POST BlogEntry detail - Make a comment
router.post('/blog/:idTitle', blogEntryController.blogEntry_detail_post);


/* Bill routes */

// GET Bill creation
router.get('/bill/create', billController.create_bill_get);

// POST Bill creation
router.post('/bill/create', billController.create_bill_post);

// GET Bill update
router.get('/bill/:id/update', billController.update_bill_get);

// POST Bill update
router.post('/bill/:id/update', billController.update_bill_post);

// POST Bill update state
router.post('/bill/:id/stateUpdate', billController.update_bill_state_post);

// GET Bill deletion
router.get('/bill/:id/delete', billController.delete_bill_get);

// POST Bill deletion
router.post('/bill/:id/delete', billController.delete_bill_post);

// GET Bill list
router.get('/bills', billController.bill_list);

// GET Bill detail
router.get('/bill/:id', billController.bill_detail);


/* UsageTrack routes */

// GET UsageTrack list
router.get('/usageTrack', usageTrackController.usageTrack_list);

/* Conversation routes */

// GET Conversation list
router.get('/mensajes', conversationController.conversation_list);

// GET Conversation detail new
router.get('/mensaje/nuevo/:id', conversationController.conversation_new);

// GET Conversation detail
router.get('/mensaje/detalle/:id', conversationController.conversation_detail);

// POST Conversation detail
router.post('/mensaje/detalle/:id', conversationController.conversation_detail_new_message);


/* EmailMessage routes */

// GET EmailMessage create
router.get('/correo/create', emailMessageController.emailMessage_create_get);

// POST EmailMessage create
router.post('/correo/create', emailMessageController.emailMessage_create_post);

// GET EmailMessage update
router.get('/correo/update/:id', emailMessageController.emailMessage_update_get);

// POST EmailMessage update
router.post('/correo/update/:id', emailMessageController.emailMessage_update_post);

// POST EmailMessage send
router.post('/correo/enviar', emailMessageController.emailMessage_send_post);

// GET EmailMessage list
router.get('/correos', emailMessageController.emailMessage_list);

// GET EmailMessage detail new
router.get('/correo/:id', emailMessageController.emailMessage_detail_get);


module.exports = router;