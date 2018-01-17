/**
 * Created by andres on 20/11/17.
 */
let Course = require('../app/models/course');
let User = require('../app/models/user');
let BlogEntry = require('../app/models/blogEntry');
let constants = require('../config/constants');
let Storage = require('@google-cloud/storage');
let storage = Storage({
    projectId: constants.project_id,
    keyFilename: constants.path_to_auth_keyfile
});
let bucket = storage.bucket(constants.google_bucket_name);

exports.uploadFile = function (req, schema) {
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