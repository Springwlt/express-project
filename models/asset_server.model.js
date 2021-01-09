const mongoose = require('mongoose');
const { mongoClient } = require('../utils/db-util');

const assetServerSchema = new mongoose.Schema({
    address: { type: String, default: null },
    max_proj_num: { type: Number, default: null },
    current_proj_num: { type: Number, default: null }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' }
});


let AssetServer = mongoClient.model('Asset_server', assetServerSchema, 'asset_server');

module.exports = AssetServer;