const config = require('../config');
exports.config = config;

const nodemailer = require('nodemailer');
exports.nodemailer = nodemailer;

const fs = require('fs');
exports.fs = fs;

const path = require('path');
exports.path = path;

const moment = require('moment');
exports.moment = moment;

const q = require("q");
exports.Q = q;

const multer = require("multer");
exports.multer = multer;

const crypto = require("crypto");
exports.crypto = crypto;

const urllib = require("urllib");
exports.urllib = urllib;

const url = require("url");
exports.url = url;

const _ = require("lodash");
exports._ = _;

exports.email = require('./email');

const JWT = require('./jwt.verify');
exports.JWT = JWT;

//user model原型链上的方法
const User = require('../models/user.model');
exports.User = User;

const bcrypt = require('bcrypt-nodejs');
exports.bcrypt = bcrypt;

const phoneCode = require('./phone.code');
exports.phoneCode = phoneCode;

const axios = require('axios');
exports.axios = axios;

const EventEmitter = require('events');
const emitter = new EventEmitter();
exports.emitter = emitter;

const getServersInfo = function (project_server_id) {
    let deferred = q.defer();
    const WapPushService = require('../services/WapPushService');
    const wapPushService = new WapPushService();
    try {
        wapPushService.getServerInfo(project_server_id).then((data) => {
            deferred.resolve({ code: 1, data: data });
        });
    } catch (error) {
        console.log('create error--> ', error);
        deferred.reject({ code: -1, msg: error });
    }
};
exports.getServersInfo = getServersInfo;

const compare = function (password, dbPassword) {
    let deferred = q.defer();
    bcrypt.compare(password, dbPassword, function (err, isMatch) {
        if (err) {
            deferred.reject({ code: -1, msg: err });
        }
        deferred.resolve({ code: 1, data: isMatch });
    });
    return deferred.promise;
};

exports.compare = compare;


const options = {
    uploadFileDir: './public/',
    docDir: './public/doc/',
    oldId: null
};
const storage_file = multer.diskStorage({
    destination: function (req, file, callback) {
        let thumbnailPath = options.uploadFileDir + 'users/' + req.body.uid;
        callback(null, options.uploadFileDir);
    },
    filename: function (req, file, callback) {
        let filename = file.originalname;
        let name = path.basename(filename).replace(/^\.+/, '');
        callback(null, filename);
    }
});

exports.storage_file = storage_file;



const hashedPssword = function (password) {
    let SALT_FACTOR = 10;
    let deferred = q.defer();
    let noop = function () { };
    bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
        if (err) {
            deferred.reject({ code: -1, msg: err });
        }
        bcrypt.hash(password, salt, noop, function (error, hashedPssword) {
            if (error) {
                deferred.reject({ code: -1, msg: error });
            }
            deferred.resolve({ code: 1, hashedPssword: hashedPssword });
        });
    });
    return deferred.promise;
}

exports.hashedPssword = hashedPssword;

const verifyTokenUserExistence = function (token) {
    let deferred = Q.defer();
    if (!token) {
        deferred.reject({ code: -1, "msg": "No query permission" });
    } else {
        let jwt = new JWT(token);
        let user = jwt.decodeToken();
        if (user.result) {
            let uid = user.result.uid;
            deferred.resolve({ code: 1, uid: uid, result: user.result });
        } else {
            deferred.reject({ code: -1, "msg": "token error" });
        }

    }
}

exports.verifyTokenUserExistence = verifyTokenUserExistence;

//正则表达式对字符串进行验证
const validation = {
    isEmailAddress: function (str) {
        let pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return pattern.test(str);  // returns a boolean
    },
    isNotEmpty: function (str) {
        let pattern = /\S+/;
        return pattern.test(str);  // returns a boolean
    },
    isNumber: function (str) {
        let pattern = /^\d+$/;
        return pattern.test(str);  // returns a boolean
    },
    isSame: function (str1, str2) {
        return str1 === str2;
    },
    Trim: function (str1, str2) {
        return str1 === str2;
    }

};

exports.validation = validation;

