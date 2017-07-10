/**
 * Created by andres on 6/06/17.
 */

let moment = require('moment');
let mongoose = require('mongoose');
let bcrypt = require('bcrypt-nodejs');
let Schema = mongoose.Schema;

let userSchema = new Schema({
    role: { type: Number, required: true },
    email: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    picture: String,
    owner: String,
    subscription: { type: Boolean, default: true },
    active: {
        isActive: Boolean,
        token: String
        },
    teacher: { type: Schema.Types.ObjectId, ref: 'Teacher' },
    student: { type: Schema.Types.ObjectId, ref: 'Student' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.virtual('activation_route').get(function () {
    return '/user/' + this.id + '/activate/' + this.active.token;
});

userSchema.virtual('nice_created').get(function () {
    return moment(this.createdAt).locale('es').format('dddd, D MMMM, YYYY, h:mm:ss A');
});

userSchema.virtual('nice_updated').get(function () {
    return moment(this.updatedAt).locale('es').format('dddd, MMMM D, YYYY, h:mm:ss A');
});

module.exports = mongoose.model( 'User', userSchema );