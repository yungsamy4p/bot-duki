const mongoose = require('mongoose');

const licenseSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    product: { type: String, required: true },
    isClaimed: { type: Boolean, default: false },
    claimedBy: { type: String, default: null },
    claimedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('License.js', licenseSchema);