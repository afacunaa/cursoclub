/**
 * Created by andres on 21/02/18.
 */

let moment = require('moment');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let usageTrackSchema = new Schema({
    ipAddress: String,
    user: String,
    detail: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

usageTrackSchema.virtual('url').get(function () {
    return '/usageTrack/' + this._id;
});

usageTrackSchema.virtual('nice_created').get(function () {
    return moment(this.createdAt).locale('es').format('dddd, D MMMM, YYYY, h:mm:ss A');
});

usageTrackSchema.virtual('nice_created_short').get(function () {
    return moment(this.createdAt).locale('es').format('DD/MM/YYYY, h:mm:ss A');
});

usageTrackSchema.virtual('nice_updated').get(function () {
    return moment(this.updatedAt).locale('es').format('dddd, MMMM D, YYYY, h:mm:ss A');
});

module.exports = mongoose.model( 'UsageTrack', usageTrackSchema );