const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    navers: [{
        type: Schema.Types.ObjectId,
        ref: 'naver'
    }],
    projetos: [{
        type: Schema.Types.ObjectId,
        ref: 'projeto'
    }]
}, { versionKey: false });

module.exports = mongoose.model('user', userSchema);