/**
 * Created by andres on 5/05/17.
 */

let moment = require('moment');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let paymentSchema = new Schema({
    system: { type: String, required: true },
    confirmationCode: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

paymentSchema.virtual('url').get(function () {
    return '/payment/' + this._id;
});

paymentSchema.virtual('nice_created').get(function () {
    return moment(this.createdAt).locale('es').format('dddd, D MMMM, YYYY, h:mm:ss A');
});

paymentSchema.virtual('nice_updated').get(function () {
    return moment(this.updatedAt).locale('es').format('dddd, MMMM D, YYYY, h:mm:ss A');
});

module.exports = mongoose.model('Payment', paymentSchema );