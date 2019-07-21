/**
 * Created by andres on 5/05/17.
 */

let constants = require('../../config/constants');
let moment = require('moment');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let teacherSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, minlength: 7, maxlength: 10 },
    mobile: { type: String, minlength: 7, maxlength: 15 },
    whatsapp: { type: Boolean },
    birthday: { type: Date },
    city: [{ type: String }],
    address: String,
    document: { type: String, required: true },
    courses: [ {
        _id: false,
        course: { type: Schema.Types.ObjectId, ref: 'Course' },
        pricePerHour: Number
    } ],
    offeredCourses: [String],
    knowledgeType: [String],
    attachment: [String],
    experienceSummary: String,
    kindOfClients: [String],
    time: [String],
    price: String,
    profileViews : [{ type: Date }],
    moreAbout: String,
    socialNetwork: {
        facebook: String,
        linkedin: String,
        twitter: String,
        blog: String,
        website: String
    },
    like: String,
    howDidKnow: String,
    description: String,
    workingArea: [String],
    score: { type: Number, min: 0, max: 5 },
    schedule: [ { type: Number, min: 0, max: 111 } ],
    member: {
        isMember: Boolean,
        isPremium: Boolean,
        premiumSince: { type: Date, default: Date.now },
        premiumUntil: { type: Date, default: Date.now }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lessons : [ { type: Schema.Types.ObjectId, ref: 'Lesson' } ]
});

teacherSchema.methods.getPriceOfCourse = function (courseId) {
    for (let i=0; i<this.courses.length; i++) {
        if (this.courses[i].course.toString() === courseId.toString()) {
            return this.courses[i].pricePerHour;
        }
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

teacherSchema.virtual('citiesAsLine').get(function () {
    let line = "";
    for (let i=0; i<this.city.length; i++) {
        if (['bogota', 'medellin', 'cali', 'bucaramanga', 'otros', 'distancia'].indexOf(this.city[i]) > -1) {
            line += constants.cities[this.city[i]];
        } else {
            line += this.city[i];
        }
        if (i !== this.city.length - 1)
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
teacherSchema.virtual('whatsapp_link').get(function () {
    return 'https://wa.me/57' + this.mobile + '?text=Hola%2c%20te%20encontr%C3%A9%20desde%20Instructorio%20y%20estoy%20interesado%20en%20una%20clase';
});

module.exports = mongoose.model('Teacher', teacherSchema );