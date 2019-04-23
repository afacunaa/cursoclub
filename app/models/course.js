/**
 * Created by andres on 5/05/17.
 */

let moment = require('moment');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let courseSchema = new Schema({
    name: { type: String, required: true },
    category: { type: String, enum: ['Académico', 'Tiempo libre', 'Entrenamiento físico', 'Virtual'] },
    description: String,
    requirement: String,
    picture: String,
    keywords: [{ type: String }],
    idName: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    teachers: [{ type: Schema.Types.ObjectId, ref: 'Teacher' }],
    externalLink: String
});

courseSchema.virtual('image').get(function () {
    let latinName = this.name;
    latinName = latinName.replace(/[áÁ]/g,'a');
    latinName = latinName.replace(/[éÉ]/g,'e');
    latinName = latinName.replace(/[íÍ]/g,'i');
    latinName = latinName.replace(/[óÓ]/g,'o');
    latinName = latinName.replace(/[úüÚÜ]/g,'u');
    return '../img/' + latinName.toLowerCase() + '.png';
});

courseSchema.virtual('url').get(function () {
    let categorySafe = this.category.toLowerCase().replace(" ", "-");
    categorySafe = categorySafe.replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o")
        .replace("ú", "u").replace("ü", "u");
    return '/curso/' + categorySafe +'/' + this.idName;
});

courseSchema.virtual('short_url').get(function () {
    return '/curso/' + this.idName;
});

courseSchema.virtual('nice_created').get(function () {
    return moment(this.createdAt).locale('es').format('dddd, D MMMM, YYYY, h:mm:ss A');
});

courseSchema.virtual('nice_updated').get(function () {
    return moment(this.updatedAt).locale('es').format('dddd, MMMM D, YYYY, h:mm:ss A');
});

module.exports = mongoose.model('Course', courseSchema );