const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const settingsSchema = new Schema({
    shopUrl: { type: String, required: true },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
    },
    active: { type: Boolean, default: false },
    configurations: { type: Object },
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
});

const index = { "shopUrl": 1 };
settingsSchema.index(index)

module.exports = mongoose.model('settings', settingsSchema);