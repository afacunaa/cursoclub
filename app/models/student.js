/**
 * Created by andres on 5/05/17.
 */

let moment = require('moment');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let studentSchema = new Schema({
    firstName: { type: String, required: true},
    lastName: { type: String, required: true },
    address: String,
    birthday: { type: Date },
    phone: { type: String, minlength: 7, maxlength: 10 },
    document: String,
    like: String,
    howDidKnow: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lessons : [{ type: Schema.Types.ObjectId, ref: 'Lesson' }]
});

studentSchema.virtual('fullName').get(function () {
    return this.firstName + ' ' + this.lastName;
});

studentSchema.virtual('shortName').get(function () {
    return this.firstName + ' ' + this.lastName[0] + '.';
});

studentSchema.virtual('url').get(function () {
    return '/student/' + this._id;
});

studentSchema.virtual('nice_birthday').get(function () {
    return moment(this.birthday).utc().locale('es').format('D MMMM, YYYY');
});

studentSchema.virtual('nice_created').get(function () {
    return moment(this.createdAt).locale('es').format('dddd, D MMMM, YYYY, h:mm:ss A');
});

studentSchema.virtual('nice_updated').get(function () {
    return moment(this.updatedAt).locale('es').format('dddd, MMMM D, YYYY, h:mm:ss A');
});

module.exports = mongoose.model( 'Student', studentSchema );