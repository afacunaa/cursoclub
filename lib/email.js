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
    EmailMessage.findOne( { idName: email } ).exec(function (err, result) {
        if (err) {
            res.send(err);
        }
        for (let i=0; i<receivers.length; i++) {
            let emailBody = result.body.replace('#NAME#', receivers[i].owner).replace('#USERNAME#', receivers[i].username)
                .replace('#ACTIVATION_ROUTE#', constants.host + receivers[i].activation_route);
            let mailOptions = {
                from: '"'+constants.smtp_from_name+'" <'+constants.smtp_from_email+'>', // sender address
                to: receivers[i].email, // list of receivers
                subject: 'Bienvenido a Instructorio', // Subject line
                html: emailBody,
                text: 'Tu cuenta ha sido creada'
            };
            // send mail with defined transport object
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    return console.log(error);
                }
            });
        }
    });
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


exports.notificate_new_lesson = function (lessons) {
    async.parallel({
        teacher: function (callback) {
            Teacher.findById(lessons[0].teacher, callback);
        },
        teacher_user: function (callback) {
            User.findOne({ teacher: lessons[0].teacher }, callback);
        },
        student: function (callback) {
            Student.findById(lessons[0].student, callback);
        },
        course: function (callback) {
            Course.findById(lessons[0].course, callback);
        },
        email: function (callback) {
            EmailMessage.findOne({ idName: 'instructor-nueva-clase' }, callback);
        }
    }, function (err, results) {
        if (err) { return next(err) }
        let lessonsPeriod;
        if (lessons.length > 1) {
            lessonsPeriod = "Fechas entre: " + lessons[0].nice_date + " y " +
                lessons[lessons.length-1].nice_date;
        } else {
            lessonsPeriod = "Fecha: " + lessons[0].nice_date;
        }
        let data = results.email.body.replace('#TEACHERNAME#', results.teacher.firstName)
            .replace('#COURSE#', results.course.name).replace('#STUDENTNAME#', results.student.fullName)
            .replace('#LESSONDATE#', lessonsPeriod)
            .replace('#ADDRESS#', results.student.address);
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


exports.notificate_change_lesson_state = function (bill, option) {
    async.parallel({
        destinatary_user: function (callback) {
            if (option === '1' || option === '0') {
                User.findOne({ student: bill.student }, callback);
            } else {
                User.findOne({ teacher: bill.teacher }, callback);
            }
        },
        destinatary: function (callback) {
            if (option === '1' || option === '0') {
                Student.findById(bill.student, callback);
            } else {
                Teacher.findById(bill.teacher, callback);
            }
        },
        lessons: function (callback) {
            Lesson.find({ bill: bill.id }, callback).populate('course').sort('date');
        },
        email: function (callback) {
            EmailMessage.findOne({ idName: 'cambio-estado-clase' }, callback);
        }
    }, function (err, results) {
        if (err) { return next(err) }
        let lessonsPeriod;
        if (results.lessons.length > 1) {
            lessonsPeriod = "entre los días " + results.lessons[0].nice_date + " y " +
                results.lessons[results.lessons.length-1].nice_date;
        } else {
            lessonsPeriod = "del " + results.lessons[0].nice_date;
        }
        let data = results.email.body.replace('#NAME#', results.destinatary.firstName)
            .replace('#COURSE#', results.lessons[0].course.name)
            .replace('#LESSONDATE#', lessonsPeriod)
            .replace('#LESSONSTATE#', results.lessons[0].state);
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