const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bidSchema = new Schema({
    item: {
        type: Schema.Types.ObjectId,
        ref: 'Item',
        required: true,
    },
    bidder: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    bidTime: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Bid', bidSchema);