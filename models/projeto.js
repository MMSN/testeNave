const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projetoSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    navers: [{
        type: Schema.Types.ObjectId,
        ref: 'naver'
    }],
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }

}, { versionKey: false });

module.exports = mongoose.model('projeto', projetoSchema);
