/**
 * Created by andres on 04/10/18.
 */

let moment = require('moment');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let emailMessageSchema = new Schema({
    name: { type: String, required: true},
    idName: String,
    body: { type: String, required: true },
    periodicity: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

emailMessageSchema.virtual('url').get(function () {
    return '/correo/' + this.id;
});

emailMessageSchema.virtual('nice_created').get(function () {
    return moment(this.createdAt).locale('es').format('dddd, D MMMM, YYYY');
});

emailMessageSchema.virtual('nice_updated').get(function () {
    return moment(this.updatedAt).locale('es').format('dddd, D MMMM, YYYY');
});

module.exports = mongoose.model( 'EmailMessage', emailMessageSchema );