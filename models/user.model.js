const mongoose = require('mongoose');
const { mongoClient } = require('../utils/db-util');
const mongoosePaginate = require('mongoose-paginate');
const bcrypt = require('bcrypt-nodejs');
const common = require('../utils/common');
const SALT_FACTOR = 10;

const userSchema = new mongoose.Schema({
    id: { type: Number, default: Date.now },
    email: { type: String, default: null },
    username: { type: String, default: '' },
    password: { type: String, default: '' },
    displayName: { type: String, default: '' },
    phone: { type: String, default: '' },
    proj_id: { type: Array },
    // assets : [{type:mongoose.Schema.Types.ObjectId, ref:'Assets'}],
    last_seen: { type: Date, default: Date.now },
    registerBy: { type: Number, default: 0 },//注册来源, 0: 未知, 1: 手机号(密码), 2: 手机号(验证码), 3: 邮箱
    state: { type: Number, default: 0 },//账号状态，0:未激活，1：正常，2:封号
    created_at: { type: Date, default: Date.now },
    // active_promo: null,
    flags: {
        openedEditor: { type: Boolean, default: true },
        opened_designer: { type: Boolean, default: false },
        tips: {
            howdoi: { type: Boolean, default: false },
            assets: { type: Boolean, default: true },
            launch: { type: Boolean, default: true },
            hierarchy: { type: Boolean, default: true },
            controls: { type: Boolean, default: true },
            dashboard: { type: Boolean, default: true },
            entityInspector: { type: Boolean, default: true },
            mainMenu: { type: Boolean, default: true },
            soundComponent: { type: Boolean, default: false },
            store: { type: Boolean, default: true },
        }
    },
    full_name: { type: String, default: '' },
    hash: { type: String, default: 'ASVdDSfV' },
    limits: {
        max_public_projects: { type: Number, default: -1 },
        disk_allowance: { type: Number, default: 200 },
        awards: { type: Array },
        max_private_projects: { type: Number, default: 0 }
    },
    organization: { type: Boolean, default: false },
    organizations: { type: Array },
    plan: { type: String, default: 'free' },
    plan_type: { type: String, default: 'free' },
    preferences: {
        email: {
            organizations: { type: Boolean, default: true },
            users: { type: Boolean, default: true },
            followed_projects: { type: Boolean, default: true },
            comments: { type: Boolean, default: true },
            general: { type: Boolean, default: true },
            organizations: { type: Boolean, default: true },
            projects: { type: Boolean, default: true },
            stars: { type: Boolean, default: true },
            store: { type: Boolean, default: true }
        }
    },
    public_key: { type: String, default: '' },
    requires_confirmation: { type: Boolean, default: true },
    size: {
        total: { type: Number, default: 49513296 },
        code: { type: Number, default: 0 },
        apps: { type: Number, default: 0 },
        assets: { type: Number, default: 12187214 },
        checkpoints: { type: Number, default: 37326082 }
    },
    skills: { type: Array },
    super_user: { type: Boolean, default: false },
    tokens: { type: Array },
    thumbnail: { type: String, default: '' },
    "ide": {
        "fontSize": { type: Number, default: 12 },
        "continueComments": { type: Boolean, default: true },
        "autoCloseBrackets": { type: Boolean, default: true },
        "highlightBrackets": { type: Boolean, default: true },
    },
    "editor": {
        "howdoi": { type: Boolean, default: true },
        "iconSize": { type: Number, default: 0.2 },
    }
    // vat_number: null
});

var noop = function () { };

userSchema.pre('save', function (done) {
    let user = this;

    if (!user.isModified('password')) {
        return done();
    }

    bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
        if (err) { return done(err); }
        bcrypt.hash(user.password, salt, noop, function (err, hashedPssword) {
            if (err) { return done(err); }
            user.password = hashedPssword;
            done();
        });
    });
});

userSchema.methods.checkPassword = function (guess, done) {
    bcrypt.compare(guess, this.password, function (err, isMatch) {
        done(err, isMatch);
    });
};

userSchema.methods.changePassword = function (password, done) {
    var user = this;
    bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
        if (err) { return done(err); }
        bcrypt.hash(password, salt, noop, function (err, hashedPssword) {
            if (err) { return done(err); }
            done(err, hashedPssword);
        });
    });
};

userSchema.methods.name = function () {
    return this.displayName || this.username;
};

userSchema.methods.uploadPath = function () {
    var p = '';
    if (this.photo) {
        p = '/assets/user/' + this.photo;
    }
    return p;
};

userSchema.methods.photo_path = function () {
    var p = '';
    if (this.photo) {
        p = '/uploads/' + this.photo;
    }
    return p;
};
userSchema.plugin(mongoosePaginate);

/*model 的参数1 导出的模块名，
参数2 创建的 Schema，
参数2 指定数据库中的集合的名字，若不加的，则抹默认取‘第一个参数s’的集合*/

let User = mongoClient.model('User', userSchema, 'user');

module.exports = User;