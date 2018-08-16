/**
 * Created by andres on 5/05/17.
 */

let moment = require('moment');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let teacherSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    document: { type: String, required: true },
    score: { type: Number, min: 0, max: 5 },
    schedule: [ { type: Number, min: 0, max: 111 } ],
    description: String,
    member: {
        isMember: Boolean,
        isPremium: Boolean,
        premiumSince: Date,
        premiumUntil: Date
    },
    request: String,

    workingArea: [String],
    birthday: { type: Date },
    city: { type: String },
    phone: { type: String, minlength: 7, maxlength: 10 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    courses : [ {
        _id: false,
        course: { type: Schema.Types.ObjectId, ref: 'Course' },
        pricePerHour: Number
    } ],
    lessons : [ { type: Schema.Types.ObjectId, ref: 'Lesson' } ]
});

teacherSchema.methods.getPriceOfCourse = function (courseId) {
    for (let i=0; i<this.courses.length; i++) {
        if (this.courses[i].course.toString() === courseId.toString())
            return this.courses[i].pricePerHour;
    }
};

teacherSchema.virtual('fullName').get(function () {
    return this.firstName + ' ' + this.lastName;
});

teacherSchema.virtual('shortName').get(function () {
    return this.firstName + ' ' + this.lastName[0] + '.';
});

teacherSchema.virtual('isPremium').get(function () {
    return this.member.isPremium && this.member.premiumUntil > new Date();
});

teacherSchema.virtual('url').get(function () {
    return '/teacher/' + this._id;
});

teacherSchema.virtual('workingAreaAsLine').get(function () {
    let line = "";
    for (let i=0; i<this.workingArea.length; i++){
        line += this.workingArea[i];
        if (i !== this.workingArea.length - 1)
            line += ", ";
    }
    return line;
});

teacherSchema.virtual('nice_birthday').get(function () {
    return moment(this.birthday).utc().locale('es').format('D MMMM, YYYY');
});

teacherSchema.virtual('nice_created').get(function () {
    return moment(this.createdAt).locale('es').format('D MMMM, YYYY - h:mm:ss A');
});

teacherSchema.virtual('nice_updated').get(function () {
    return moment(this.updatedAt).locale('es').format('D MMMM, YYYY - h:mm:ss A');
});

module.exports = mongoose.model('Teacher', teacherSchema );