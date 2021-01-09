const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const { mongoClient } = require('../utils/db-util');

const projectSchema = new mongoose.Schema({
    id: { type: Number, default: null },//用户权限
    name: { type: String, default: '' },//项目名称
    owner: { type: String, default: '' },//创建者
    owner_id: { type: Number, default: null },//创建者id
    owner_plan_type: { type: String, default: '' },//创建者plan_type
    new_owner: { type: String, default: '' },//
    permissions: { //各级权限的用户的用户名数组
        admin: { type: Array },
        read: { type: Array },
        write: { type: Array }
    },//
    plays: { type: Number, default: 0 },//未知
    primary_app: { type: Number, default: null },//未知
    locked: { type: Boolean, default: false },//未知
    private: { type: Boolean, default: false },//是不是私有private项目
    starred: { type: Number, default: 1 },//未知
    views: { type: Number, default: 0 },//未知
    access_level: { type: String, default: '' },//用户权限
    description: { type: String, default: '' },//项目描述
    collaborators: { type: Array },//项目组成员
    created: { type: Date, default: Date.now },
    modified: { type: Date, default: Date.now },
    thumbnails: { type: String, default: null },
    editor_version: { type: String, default: null },//编辑器版本号
    setting: {
        "antiAlias": { type: Boolean, default: true },
        "fillMode": { type: String, default: "FILL_WINDOW" },
        "resolutionMode": { type: String, default: "AUTO" },
        "height": { type: Number, default: 720 },
        "width": { type: Number, default: 1280 },
        "use3dPhysics": { type: Boolean, default: true },
        "preferWebGl2": { type: Boolean, default: true },
        "preserveDrawingBuffer": { type: Boolean, default: false },
        "scripts": { type: Array },
        "transparentCanvas": { type: Boolean, default: false },
        "useDevicePixelRatio": { type: Boolean, default: true },
        "useLegacyScripts": { type: Boolean, default: false },
        "vr": { type: Boolean, default: false },
        "loadingScreenScript": { type: Object, default: null },
        "batchGroups": { type: Object },
        "layers": { type: Object },
        "layerOrder": { type: Array },
        "item_id": { type: Number, default: null },
        "project": { type: Number, default: null },
        "name": { type: String, default: "project" },
        "branch_id": { type: String, default: '' },
        "checkpoint_id": { type: String, default: '' },
        "useKeyboard": { type: Boolean, default: true },
        "useMouse": { type: Boolean, default: true },
        "useTouch": { type: Boolean, default: true },
        "useGamepads": { type: Boolean, default: false },
        "i18nAssets": { type: Array }
    }
}, {
    versionKey: false,
    timestamps: { createdAt: 'created', updatedAt: 'modified' }
});


projectSchema.plugin(mongoosePaginate);


let Project = mongoClient.model('Project', projectSchema, 'project');

module.exports = Project;
