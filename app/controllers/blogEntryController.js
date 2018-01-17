/**
 * Created by andres on 23/11/17.
 */

let BlogEntry = require('../models/blogEntry');

// Display all blogEntry GET
exports.blogEntry_list = function (req, res, next) {
    //res.send('Lista de transaccions');
    BlogEntry.find({ })
        .sort('-createdAt')
        .exec(function (err, list_blogEntry) {
            if (err) { return next(err) }
            res.render('blogEntry_list', { title: 'Blog de CursoClub', blogEntry_list: list_blogEntry, user: req.user });
        });
};

// Display the details of a blogEntry GET
exports.blogEntry_detail_get = function (req, res, next) {
    //res.send('Detalle de Noticia ' + req.params.id);
    BlogEntry.findById(req.params.id)
        .populate('comments.user')
        .exec(function (err, blogEntry_result) {
            if (err){
                return next(err);
            }
            res.render('blogEntry_detail', { title: blogEntry_result.title + ' - Blog de Curso Club', blogEntry: blogEntry_result, user: req.user });
        });
};

// Display the details of a blogEntry POST - POST a comment
exports.blogEntry_detail_post = function (req, res, next) {
    BlogEntry.findById(req.params.id)
        .exec(function (err, blogEntry_result) {
            if (err){
                return next(err);
            }
            let comment = {
                user: req.user,
                post: req.body.comment_text,
                postDate: Date.now()
            };
            blogEntry_result.comments.push(comment);
            blogEntry_result.save();
            res.redirect(blogEntry_result.url+'#comentarios');
        });
};

// Create a blogEntry GET
exports.create_blogEntry_get = function (req, res, next) {
    //res.send('Crear transaccion');
    res.render('create_blogEntry', { title: 'Crear entrada del Blog', user: req.user });
};

// Create a blogEntry POST
exports.create_blogEntry_post = function (req, res, next) {
    //res.send('Crear transaccion');
    let blogEntry = new BlogEntry(
        {
            title: req.body.title,
            body: req.body.body,
            author: req.body.author,
            keywords: (typeof req.body.keywords==='undefined') ? [] : req.body.keywords.toString().split(',')
        }
    );
    blogEntry.save(function (err) {
        if (err) {
            return next(err)
        }
        res.redirect(blogEntry.url);
    })
};

// Delete a blogEntry GET
exports.delete_blogEntry_get = function (req, res, next) {
    res.send('Eliminar blog ' + req.params.id);
};

// Delete a blogEntry POST
exports.delete_blogEntry_post = function (req, res, next) {
    res.send('Eliminar blog' + req.params.id);
};

// Update a blogEntry GET
exports.update_blogEntry_get = function (req, res, next) {
    res.send('Actualizar blog' + req.params.id);
};

// Update a blogEntry POST
exports.update_blogEntry_post = function (req, res, next) {
    res.send('Actualizar blog' + req.params.id);
};