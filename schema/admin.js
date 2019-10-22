const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminUserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now },
    resetPasswordToken: { type : String},
    resetPasswordExpires: { type: Date }
});

module.exports = mongoose.model('admin', adminUserSchema);