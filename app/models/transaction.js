/**
 * Created by andres on 5/05/17.
 */

let moment = require('moment');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let transactionSchema = new Schema({
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lesson : { type: Schema.Types.ObjectId, ref: 'Lesson' }
});

transactionSchema.virtual('url').get(function () {
    return '/transaction/' + this._id;
});

transactionSchema.virtual('nice_created').get(function () {
    return moment(this.createdAt).locale('es').format('dddd, D MMMM, YYYY, h:mm:ss A');
});

transactionSchema.virtual('nice_updated').get(function () {
    return moment(this.updatedAt).locale('es').format('dddd, MMMM D, YYYY, h:mm:ss A');
});

module.exports = mongoose.model('Transaction', transactionSchema );