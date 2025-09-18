const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    startingPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    seller: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    currentBid: {
        type: Number,
        default: 0,
    },
    bidder: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
});

module.exports = mongoose.model('Item', itemSchema);