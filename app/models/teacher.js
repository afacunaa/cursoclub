/**
 * Created by andres on 5/05/17.
 */

let moment = require('moment');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let teacherSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    document: { type: String, required: true, unique: true },
    score: { type: Number, min: 0, max: 5 },
    schedule: [ { type: Number, min: 0, max: 83 } ],
    description: String,
    pricePerHour: String ,
    birthday: { type: Date, required: true },
    address: { type: String, required: true },
    phone: { type: String, minlength: 7, maxlength: 10 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    courses : [ { type: Schema.Types.ObjectId, ref: 'Course' } ],
    lessons : [ { type: Schema.Types.ObjectId, ref: 'Lesson' } ]
});

teacherSchema.methods.getPriceOfCourse = function (courseId) {
    let index = this.pricePerHour.indexOf(courseId);
    let start = this.pricePerHour.indexOf(':', index);
    let end = this.pricePerHour.indexOf('>', index);
    return this.pricePerHour.substring(start+1, end)
};

teacherSchema.virtual('fullName').get(function () {
    return this.firstName + ' ' + this.lastName;
});

teacherSchema.virtual('url').get(function () {
    return '/teacher/' + this._id;
});

teacherSchema.virtual('nice_birthday').get(function () {
    return moment(this.birthday).utc().locale('es').format('D MMMM, YYYY');
});

teacherSchema.virtual('nice_created').get(function () {
    return moment(this.createdAt).locale('es').format('dddd, D MMMM, YYYY, h:mm:ss A');
});

teacherSchema.virtual('nice_updated').get(function () {
    return moment(this.updatedAt).locale('es').format('dddd, MMMM D, YYYY, h:mm:ss A');
});

module.exports = mongoose.model('Teacher', teacherSchema );