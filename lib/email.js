let nodemailer = require('nodemailer');
let smtpTransport = require('nodemailer-smtp-transport');
let async = require('async');
let constants = require('../config/constants');
let Teacher = require('../app/models/teacher');
let User = require('../app/models/user');
let Course = require('../app/models/course');
let Student = require('../app/models/student');
let EmailMessage = require('../app/models/emailMessage');
let Lesson = require('../app/models/lesson');

let transporter = nodemailer.createTransport(smtpTransport({
    host: constants.email_smtp_host,
    port: constants.email_smtp_port,
    secure: false,
    auth: {
        user: constants.smtp_from_email,
        pass: 'T5c88_HJ41Y!_Y'
    },
    tls: {
        rejectUnauthorized: false
    }
}));


exports.welcome_teacher_email = function(email, activation_route, name, username) {
    EmailMessage.findOne( { idName: 'instructor-activacion' } ).exec(function (err, result) {
        result.body = result.body.replace('#NAME#', name).replace('#USERNAME#', username)
            .replace('#ACTIVATION_ROUTE#', constants.host + activation_route);
        let mailOptions = {
            from: '"'+constants.smtp_from_name+'" <'+constants.smtp_from_email+'>', // sender address
            to: email, // list of receivers
            subject: 'Bienvenido a Instructorio', // Subject line
            html: result.body,
            text: 'Tu cuenta ha sido creada'
        };
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return console.log(error);
            }
        });
    });
};

exports.teacherFirstSteps = function(email, name) {
    EmailMessage.findOne( { idName: 'instructor-primeros-pasos' } ).exec(function (err, result) {
        result.body = result.body.replace('#NAME#', name);
        let mailOptions = {
            from: '"'+constants.smtp_from_name+'" <'+constants.smtp_from_email+'>', // sender address
            to: email, // list of receivers
            subject: 'Bienvenido a Instructorio', // Subject line
            html: result.body,
            text: 'Acá unos tips para que completes tu perfil'
        };
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return console.log(error);
            }
        });
    });
};

exports.sendEmail = function(email, receivers) {
    for (let i=0; i<receivers.length; i++) {

    }
};


exports.welcome_student_email = function(email, activation_route, name, username) {
    // setup e-mail data with unicode symbols
    EmailMessage.findOne( { idName: 'usuario-activacion' } ).exec(function (err, result) {
        result.body = result.body.replace('#NAME#', name).replace('#USERNAME#', username)
            .replace('#ACTIVATION_ROUTE#', constants.host + activation_route);
        let mailOptions = {
            from: '"'+constants.smtp_from_name+'" <'+constants.smtp_from_email+'>', // sender address
            to: email, // list of receivers
            subject: 'Bienvenido a Instructorio', // Subject line
            html: result.body,
            text: 'Tu cuenta ha sido creada'
        };
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return console.log(error);
            }
        });
    });
};


exports.welcome_student_facebook_email = function(email, name) {
    // setup e-mail data with unicode symbols
    let data = `
<h2 style="color: #9c27b0">Bienvenido a Instructorio</h2>
<p>Hola `+name+`, ahora eres parte de <b style="color: #9c27b0">Instructorio</b>. Aquí podrás encontrar clases de todo aquello que siempre has querido aprender.
    Ingresa ahora mismo y configura completamente tu perfil y empieza a solicitar tus clases.</p>
    <h4>Tu cuenta ya se encuentra activa, ingresa siempre a través de <span style="color: #1565c0">Facebook</span></h4>
<br>
<p>Esperamos que tu experiencia en <b style="color: #9c27b0">Instructorio</b> sea maravillosa</p>
`;
    let mailOptions = {
        from: '"'+constants.smtp_from_name+'" <'+constants.smtp_from_email+'>', // sender address
        to: email, // list of receivers
        subject: 'Bienvenido a Instructorio', // Subject line
        html: data,
        text: 'Tu cuenta ha sido creada'
    };
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Correo de bienvenida enviado');
    });
};


exports.notificate_new_class = function (lesson) {
    async.parallel({
        teacher: function (callback) {
            Teacher.findById(lesson.teacher, callback);
        },
        teacher_user: function (callback) {
            User.findOne({ teacher: lesson.teacher }, callback);
        },
        student: function (callback) {
            Student.findById(lesson.student, callback);
        },
        course: function (callback) {
            Course.findById(lesson.course, callback);
        }
    }, function (err, results) {
        if (err) { return next(err) }
        let data = `
<h2 style="color: #ff9800">Tienes una nueva solicitud para una clase</h2>
<p>Hola ` + results.teacher.firstName + `, alguien acaba de solicitar una clase de <span style="color: #4caf50">`
            + results.course.name + `</span> contigo:</p>
<ul>
    <li>Nombre del alumno: ` + results.student.fullName + `</li>
    <li>Fecha: ` + lesson.nice_date + `</li>
    <li>Dirección: ` + results.student.address + `</li>
</ul>
<p>Ingresa a Instructorio para conocer más detalles y aceptarla o rechazarla</p>
`;
        let mailOptions = {
            from: '"'+constants.smtp_from_name+'" <'+constants.smtp_from_email+'>', // sender address
            to: results.teacher_user.email, // list of receivers
            subject: 'Alguien ha solicitado una clase en Instructorio', // Subject line
            html: data,
            text: 'Nueva clase apartada'
        };
        if (results.teacher_user.subscription) {
            // send mail with defined transport object
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    return console.log(error);
                }
                console.log('Correo de notificación enviado');
            });
        } else {
            console.log('Sin notificación');
        }
    });
};


exports.notificate_change_class_state = function (lesson, option) {
    async.parallel({
        destinatary_user: function (callback) {
            if (option === '1' || option === '0') {
                User.findOne({ student: lesson.student }, callback);
            } else {
                User.findOne({ teacher: lesson.teacher }, callback);
            }
        },
        destinatary: function (callback) {
            if (option === '1' || option === '0') {
                Student.findById(lesson.student, callback);
            } else {
                Teacher.findById(lesson.teacher, callback);
            }
        },
        course: function (callback) {
            Course.findById(lesson.course, callback);
        }
    }, function (err, results) {
        if (err) { return next(err) }
        let data = `
<h2 style="color: #009688">Una clase tuya acaba de cambiar su estado</h2>
<p>Hola ` + results.destinatary.firstName + `, tu clase de <span style="color: #03a9f4">` + results.course.name + `</span> 
para el día ` + lesson.nice_date + ` pasó a estar: <b>` + lesson.state + `</b></p>
<p>Ingresa ya a Instructorio para revisar más detalles y las acciones asociadas a este cambio</p>
`;
        let mailOptions = {
            from: '"'+constants.smtp_from_name+'" <'+constants.smtp_from_email+'>', // sender address
            to: results.destinatary_user.email, // list of receivers
            subject: 'Una clase tuya en Instructorio ha cambiado su estado', // Subject line
            html: data,
            text: 'Cambio en estado'
        };
        if (results.destinatary_user.subscription) {
            // send mail with defined transport object
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    return console.log(error);
                }
                console.log('Correo de notificación enviado');
            });
        } else {
            console.log('Sin notificación');
        }
    });
};

exports.contactus = function (name, email, message) {
    let data = `
<h2 style="color: #ff9800">Nuevo mensaje de: ` + name + ` - ` + email + `</h2>
<p>"` + message + `"</p>
`;
    let mailOptions = {
        from: '"'+constants.smtp_from_name+'" <'+constants.smtp_from_email+'>', // sender address
        to: constants.smtp_from_email, // list of receivers
        subject: 'Mensaje de '+name, // Subject line
        html: data,
        text: 'Mensaje de contacto'
    };
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Correo de contacto enviado');
    });
};

exports.recoverPassword = function (user, hashedKey) {
    let data = `
<h2 style="color: #009688">Hola  `+ user.owner + `</h2>
<p>Haz hecho una solicitud para restablecer tu contraseña. Para poder asignar una nueva contraseña, haz clic en este 
<a href="` + constants.host +`/user/recovery?continueProcess=yes&user=` + user.email + `&key=` + hashedKey + `">enlace</a> y asigna una nueva contraseña.
</p>
<p>Si tú no has iniciado este proceso, haz clic <a href="` + constants.host + `/user/recovery?continueProcess=no&user=` + user.email + `">acá</a> 
para revocarlo. Continuarás usando la contraseña que tenías registrada.</p>
`;
    let mailOptions = {
        from: '"'+constants.smtp_from_name+'" <'+constants.smtp_from_email+'>', // sender address
        to: user.email, // list of receivers
        subject: 'Instructorio - Recuperación de contraseña', // Subject line
        html: data,
        text: 'Recuperación de contraseña'
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Correo de recuperación enviado');
    });
};