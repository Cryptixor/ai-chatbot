const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    character: {
        type: String,
        required: true
    },
    messages: [{
        role: String,
        content: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
});

module.exports = mongoose.model('ChatHistory', chatHistorySchema); 