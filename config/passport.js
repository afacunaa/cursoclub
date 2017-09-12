let LocalStrategy = require('passport-local').Strategy;
let FacebookStrategy = require('passport-facebook').Strategy;
let emailer = require('../lib/email');
let constants = require('./constants');
let User = require('../app/models/user');
let Student = require('../app/models/student');

//expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) { // callback with email and password from our form
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({ 'username' :  username }, function(err, user) {
                //console.log('Profesor encontrado: '+teacher);
                // if there are any errors, return the error before anything else
                if (err)
                    return done(null, false, req.flash('error', err)); // req.flash is the way to set flashdata using connect-flash
                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('error', 'Usuario no encontrado. Regístrate')); // req.flash is the way to set flashdata using connect-flash
                // if the user is found but the password is wrong
                if (!user.validPassword(password))
                    return done(null, false, req.flash('error', 'El nombre de usuario o la contraseña no coinciden.')); // create the loginMessage and save it to session as flashdata
                if (!user.active.isActive)
                    return done(null, false, req.flash('error', 'Esta cuenta aún no ha sido activada por correo electrónico.'));
                // all is well, return successful user
                return done(null, user);
            });
        }));

    // =========================================================================
    // FACEBOOK LOGIN ==========================================================
    // =========================================================================

    passport.use(new FacebookStrategy({
            // pull in our app id and secret from our auth.js file
            clientID: constants.facebookAuth.clientID,
            clientSecret: constants.facebookAuth.clientSecret,
            callbackURL: constants.facebookAuth.callbackURL,
            profileFields: ['name', 'picture.height(600)', 'emails', 'birthday']
        },
        // facebook will send back the token and profile
        function (token, refreshToken, profile, done) {
            process.nextTick( function() {
                //console.dir(profile, {depth: null});
                // find the user in the database based on their facebook id
                User.findOne({ 'username' : profile.id }, function(err, user) {
                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if (err)
                        return done(err);
                    // if the user is found, then log them in
                    if (user) {
                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user found with that facebook id, create them
                        let newStudent = new Student(
                            {   firstName: profile.name.givenName,
                                lastName: profile.name.familyName,
                            }
                        );
                        let newUser = new User(
                            {   role: constants.student_role,
                                email: profile.emails[0].value,
                                username: profile.id,
                                password: profile.id,
                                active: { isActive: true, token: newStudent.id },
                                owner: newStudent.fullName,
                                picture: profile.photos[0].value,
                                student: newStudent.id  }
                        );
                        // save our user to the database
                        newStudent.save(function (err) {
                            if (err) {
                                console.log('error encontrado: ' + err);
                                throw err;
                            }
                        });
                        newUser.save(function(err) {
                            if (err) {
                                throw err;
                            }
                            // if successful, return the new user
                            emailer.welcome_student_facebook_email(newUser.email, newStudent.firstName);
                            return done(null, newUser);
                        });
                    }

                });
            });

        }));
};

    
    





