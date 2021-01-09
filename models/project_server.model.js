const mongoose = require('mongoose');
const { mongoClient } = require('../utils/db-util');

const projectServerSchema = new mongoose.Schema({
    address: { type: String, default: null },
    max_proj_num: { type: Number, default: null },
    current_proj_num: { type: Number, default: null },
    editor_versions: { type: Array },
    asset_server_id: { type: mongoose.Types.ObjectId },
    websocket_url: { type: String }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'modifiedAt' }
});

let ProjectServer = mongoClient.model('Project_server', projectServerSchema, 'project_server');

module.exports = ProjectServer;
