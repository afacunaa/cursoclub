/**
 * Created by andres on 15/05/18.
 */

let moment = require('moment');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let conversationSchema = new Schema({
    user1: {
        user: {
            type: Schema.Types.ObjectId, ref: 'User'
        },
        unread: Boolean
    },
    user2: {
        user: {
            type: Schema.Types.ObjectId, ref: 'User'
        },
        unread: Boolean
    },
    message: [ {
        _id: false,
        createdAt: { type: Date, default: Date.now },
        text: String,
        sender: { type: Schema.Types.ObjectId, ref: 'User' }
    } ],
    lastActive: { type: Date, default: Date.now }
});

conversationSchema.methods.getNiceDate = function (date) {
    return moment(date).locale('es').format('DD/MM/YYYY, h:mm:ss A');
};

conversationSchema.virtual('url').get(function () {
    return '/mensaje/detalle/' + this.id;
});

module.exports = mongoose.model( 'Conversation', conversationSchema );