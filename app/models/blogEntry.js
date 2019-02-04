/**
 * Created by andres on 23/11/17.
 */

let moment = require('moment');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let blogEntrySchema = new Schema({
    title: { type: String, required: true},
    idTitle: String,
    body: { type: String, required: true },
    images: [String],
    author: String,
    keywords: [String],
    metaDescription: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    comments: [{ user: { type: Schema.Types.ObjectId, ref: 'User' }, post: String, postDate: { type: Date, default: Date.now } }]
});

blogEntrySchema.virtual('url').get(function () {
    return '/blog/' + this.idTitle;
});

blogEntrySchema.virtual('nice_created').get(function () {
    return moment(this.createdAt).locale('es').format('dddd, D MMMM, YYYY');
});

blogEntrySchema.virtual('nice_updated').get(function () {
    return moment(this.updatedAt).locale('es').format('dddd, MMMM D, YYYY');
});

blogEntrySchema.methods.niceCommentPostDate = function(date) {
    return moment(date).locale('es').format('dddd, MMMM D, YYYY, h:mm:ss A');
};

blogEntrySchema.virtual('plain_body').get(function () {
    return this.body.replace(/ *<[^>]*> */g, " ");
});

module.exports = mongoose.model( 'BlogEntry', blogEntrySchema );