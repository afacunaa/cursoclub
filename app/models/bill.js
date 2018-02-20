/**
 * Created by andres on 23/01/18.
 */

let moment = require('moment');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let billSchema = new Schema({
    state: String,
    total: { type: Number, required: true },
    student : { type: Schema.Types.ObjectId, ref: 'Student' },
    teacher : { type: Schema.Types.ObjectId, ref: 'Teacher' },
    payment : { type: Schema.Types.ObjectId, ref: 'Payment' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

billSchema.virtual('url').get(function () {
    return '/bill/' + this._id;
});

billSchema.virtual('nice_created').get(function () {
    return moment(this.createdAt).locale('es').format('dddd, D MMMM, YYYY, h:mm:ss A');
});

billSchema.virtual('nice_updated').get(function () {
    return moment(this.updatedAt).locale('es').format('dddd, MMMM D, YYYY, h:mm:ss A');
});

module.exports = mongoose.model( 'Bill', billSchema );