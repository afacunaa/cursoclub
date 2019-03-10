/**
 * Created by andres on 5/05/17.
 */

let moment = require('moment');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let lessonSchema = new Schema({
    date: { type: Date, required: true },
    state: { type: String, enum: ['Solicitada', 'Aceptada', 'Rechazada', 'Pendiente', 'Realizada'], required: true },
    message: String,
    answer: String,
    address: String,
    numberOfStudents: Number,
    price: Number,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    student : { type: Schema.Types.ObjectId, ref: 'Student' },
    teacher : { type: Schema.Types.ObjectId, ref: 'Teacher' },
    course : { type: Schema.Types.ObjectId, ref: 'Course' },
    bill: { type: Schema.Types.ObjectId, ref: 'Bill' }
});

lessonSchema.virtual('url').get(function () {
    return '/lesson/' + this._id;
});

lessonSchema.virtual('nice_date').get(function () {
    return moment(this.date).locale('es').format('dddd D [de] MMMM [de] YYYY, h:mm:ss A');
});

lessonSchema.methods.getNiceDate = function (date, offset) {
    return moment(new Date(date.getTime() - offset)).locale('es').format('DD/MM/YYYY, h:mm:ss A');
};

lessonSchema.virtual('nice_date_short').get(function () {
    return moment(this.date).locale('es').format('DD/MM/YYYY, h:mm:ss A');
});

lessonSchema.methods.getNiceShortDate = function (date, offset) {
    return moment(date).locale('es').format('DD/MM/YYYY, h:mm:ss A');
};

lessonSchema.virtual('nice_created').get(function () {
    return moment(this.createdAt).locale('es').format('dddd, D MMMM, YYYY, h:mm:ss A');
});

lessonSchema.virtual('nice_updated').get(function () {
    return moment(this.updatedAt).locale('es').format('dddd, MMMM D, YYYY, h:mm:ss A');
});

module.exports = mongoose.model( 'Lesson', lessonSchema );