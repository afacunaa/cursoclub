/**
 * Created by andres on 20/11/17.
 */
let Course = require('../app/models/course');
let User = require('../app/models/user');
let Teacher = require('../app/models/teacher');
let BlogEntry = require('../app/models/blogEntry');
let constants = require('../config/constants');
let Storage = require('@google-cloud/storage');
let storage = Storage({
    projectId: constants.project_id,
    keyFilename: constants.path_to_auth_keyfile
});
let bucket = storage.bucket(constants.google_bucket_name);

exports.uploadFileGC = function (req, schema) {
    let filename = Date.now() + req.file.originalname;
    let blob = bucket.file(filename);
    let blobStream = blob.createWriteStream();
    blobStream.on('finish', function () {
        // The public URL can be used to directly access the file via HTTP.
        let publicUrl = 'https://storage.googleapis.com/' + constants.google_bucket_name + '/' + filename;
        if (schema === 'Course') {
            Course.findOneAndUpdate({idName: req.params.idName}, {$set: {picture: publicUrl}}, {new: true}, function (err, doc) {
                if (err) {
                    return next(err)
                }
            });
        } else if (schema === 'User'){
            User.findOneAndUpdate({ _id: req.user.id }, { $set: { picture: publicUrl } }, { new: true }, function(err, doc) {
                if (err) { return next(err) }
            });
        } else if (schema === 'BlogEntry'){
            console.log("Si está entrando aca "+publicUrl);
            BlogEntry.findOneAndUpdate({ idTitle: req.params.idTitle }, { $set: { image: publicUrl } }, { new: true }, function(err, doc) {
                if (err) { return next(err) }
                console.log("Guardado: "+doc.image);
            });
        }
    });
    blobStream.end(req.file.buffer);
};

exports.uploadFile = function (req, schema) {
    if (schema === 'Course') {
        let filePath = constants.upload_directory_reference + req.files.coursePicutre[0].filename;
        Course.findOneAndUpdate({idName: req.params.idName}, {$set: {picture: filePath}}, {new: true}, function (err, doc) {
            if (err) {
                return next(err)
            }
        });
    } else if (schema === 'User') {
        let filePath = constants.upload_directory_reference + req.files.userPicutre[0].filename;
        User.findOneAndUpdate({ _id: req.params.id }, { $set: { picture: filePath } }, { new: true }, function(err, doc) {
            if (err) { return next(err) }
        });
    } else if (schema === 'BlogEntry') {
        let images = [];
        for (let i=0; i<req.files.blogGallery.length; i++) {
            images.push(constants.upload_directory_reference + req.files.blogGallery[i].filename);
        }
        BlogEntry.findOneAndUpdate({ idTitle: req.params.idTitle }, { $set: { images: images } }, { new: true }, function(err, doc) {
            if (err) { return next(err) }
        });
    } else if (schema === 'Teacher') {
        let attachments = [];
        if (req.files.teacherFiles) {
            for (let i = 0; i < req.files.teacherFiles.length; i++) {
                attachments.push(constants.upload_directory_reference + req.files.teacherFiles[i].filename);
            }
            Teacher.findOneAndUpdate({_id: req.customQuery}, {$set: {attachment: attachments}}, {new: true}, function (err, doc) {
                if (err) {
                    return next(err)
                }
            });
        }
    }
    return true;
};