const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const naverSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    birthdate: {
        type: Date,
        required: true
    },
    admissiondate: {
        type: Date,
        required: true
    },
    jobrole: {
        type: String,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    projetos: [{
        type: Schema.Types.ObjectId,
        ref: 'projeto'
    }]

}, { versionKey: false });

module.exports = mongoose.model('naver', naverSchema);
