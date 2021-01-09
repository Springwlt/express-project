let Q = require('q');
let User = require('../models/user.model');
// let     Project  = require('./project.model');
// let     File  = require('./file.model');
let ObjectId = require('mongoose').Types.ObjectId;

const express = require('express');
const fs = require("fs");

const _existsSync = fs.existsSync;
// -----


const options = {
    ssl: null,
    oldId : null,
    thumbnailPath: "./assets/user/",

    getSuffix: function (name) {
        var index = name.lastIndexOf(".");
        var suffix = name.substring(index);
        return suffix;
    },

    initUrls: function (req, path) {
        var baseUrl = (options.ssl ? 'https:' : 'http:') +
            '//' + req.headers.host;
        let url = baseUrl + "/" + path;
        return url;
    },

    getId: function () {

        let id = new Date().getTime();

        if ( this.oldId && this.oldId == id ) 
        {
            while ( id == this.oldId  )
            {
                id = new Date().getTime();
            }

            this.oldId = id;

            return id;
        }
        else
        {
            this.oldId = id;
            return id;
        }
    }
}


var service = {};

service.login = login;
service.loginPhone = loginPhone;
service.loginByPhoneCode = loginByPhoneCode;
service.create = createUser;
service.updateById = updateById;
service.changePassword = changePassword;
service.getbyquery = getUserByQuery;
service.getAllByUId = getAllByUId;
service.getUserOrCreate = getUserOrCreate;
service.existVerify = existVerify;

module.exports = service;

// init()

function init(){
    adminService.getSetting()
    .then((result)=>{
        // console.log("获取配置文件：",result);
        if (result)
        {
            options.setting = result.setting;
        }
    })
    .catch((err)=>{
        console.log("获取配置文件失败",err);
    })
}

// 创建文件夹
function createFolder(path) {
    console.log("创建文件夹：", path, _existsSync(path));
    if (_existsSync(path)) {
        return;
    }
    console.log("---创建文件夹：", _existsSync(path));
    fs.mkdirSync(path, 0777);

    return;
}

function deleteFolder(path) {
    if (!_existsSync(path)) {
        return;
    }
    if (fs.statSync(path).isFile()) {
        fs.unlinkSync(path);
        return;
    }

    let removeFolder = (path) => {
        if (fs.readdirSync(path).length == 0) {
            fs.rmdirSync(path);
        }
        else {
            setTimeout(() => { removeFolder(path) }, 200)
        }
    }

    var files = [];
    files = fs.readdirSync(path);
    for (let file of files) {
        var curPath = path + "/" + file;
        let stat = fs.statSync(curPath)
        if (stat.isDirectory()) {
            deleteFolder(curPath);
        }
        else if (stat.isFile()) {
            fs.unlinkSync(curPath);
        }
    }
    removeFolder(path);
}

function register() {
    var deferred = Q.defer();



    return deferred.promise;
}

function registerByEmail(userParam) { 
 
    var deferred = Q.defer();
    
    let query = { email: userParam.email };

    User.findOne( query, (err, user) => {
        if (err) 
        {
            deferred.reject(err);
            return deferred.promise;
        }
        
        if (user) 
        {
            deferred.reject("该用户已存在: " + user.email);
        } 
        else 
        {
            var newUser = new User(param);
            newUser.save(function (err, user) {
                if (err) deferred.reject(err);
                else deferred.resolve(user);
            });
        }
    });

    return deferred.promise;

}

function registerByPhone(userParam) { 
 
    var deferred = Q.defer();
    
    let query = { email: userParam.email };

    User.findOne( query, (err, user) => {
        if (err) 
        {
            deferred.reject(err);
            return deferred.promise;
        }
        
        if (user) 
        {
            deferred.reject("该用户已存在: " + user.email);
        } 
        else 
        {
            var newUser = new User(param);
            newUser.save(function (err, user) {
                if (err) deferred.reject(err);
                else deferred.resolve(user);
            });
        }
    });

    return deferred.promise;

}


/*
*  createUser 新建用户信息
*  @param userParam 用户基本信息
* */
function createUser(query,userParam) {
    var deferred = Q.defer();
    // let query = { email: userParam.email };
    // validation
    User.findOne(
        query,
        function (err, user) {
            if (err) {
                deferred.reject(err);
            }
            else {
                if (user) {
                    // username already exists
                    deferred.reject("该用户已存在: " + user.email);
                } else {
                    var newUser = new User(userParam);
                    newUser.save(function (err, user) {
                        if (err) deferred.reject(err);
                        else deferred.resolve(user);
                    });
                }
            }
        }
    );

    return deferred.promise;
}

function loginPhone(userParam,query) {
    var deferred = Q.defer();
    
    if(!query && !userParam.phone)
    {
        res.send("请选择登录方式！");
        return;
    }

    query = query || { phone: userParam.phone };

    User.findOne(query, function (err, user) {
        if (err || !user) { 
            if (!user)
                deferred.reject("该用户不存在，请先注册或者选择手机验证码登录！");
            else
                deferred.reject(err);
        }
        else {
            user.checkPassword(userParam.password, function (err, isMatch) {
                if (err) {
                    deferred.reject(err);
                }
                else {
                    if (isMatch) {
                        User.updateOne({_id:user._id}, {loginAt:Date.now()})
                        .exec((err, res)=>{
                            console.log("更新登录时间：",err,res);
                        });
                        
                        // let userone = JSON.parse(JSON.stringify(user));
                        // let result = Object.assign({setting:options.setting},userone);
                        deferred.resolve(user);
                        // deferred.resolve(Object.assign({setting:options.setting},user));
                    } else {
                        deferred.reject("Password verification failed, please confirm and try again");
                    }
                }
            });
        }
    });

    return deferred.promise;
}

function login(userParam,query) {
    var deferred = Q.defer();
    
    if(!query && !userParam.email)
    {
        res.send("请选择登录方式！");
        return;
    }

    query = query || { email: userParam.email };

    User.findOne(query, function (err, user) {
        if (err || !user) { 
            if (!user)
                deferred.reject("该用户不存在，请先注册或者选择手机验证码登录！");
            else
                deferred.reject(err);
        }
        else {
            user.checkPassword(userParam.password, function (err, isMatch) {
                if (err) {
                    deferred.reject(err);
                }
                else {
                    if (isMatch) {
                        User.updateOne({_id:user._id}, {loginAt:Date.now()})
                        .exec((err, res)=>{
                            console.log("更新登录时间：",err,res);
                        });
                        
                        // let userone = JSON.parse(JSON.stringify(user));
                        // let result = Object.assign({setting:options.setting},userone);
                        deferred.resolve(user);
                        // deferred.resolve(Object.assign({setting:options.setting},user));
                    } else {
                        deferred.reject("Password verification failed, please confirm and try again");
                    }
                }
            });
        }
    });

    return deferred.promise;
}


function loginByPhoneCode(phone) {

    var deferred = Q.defer();
    
    if(!phone)
    {
        res.send("请传入正确的电话号码");
        return;
    }

    User.findOne({phone}, function (err, user) {
        if(user)
        {
            deferred.resolve(user);
            
            User.updateOne({_id:user._id}, {loginAt:Date.now()})
            .exec((err, res)=>{
                console.log("更新登录时间：",err,res);
            });
        }
        else
        {
            if (!user)
                deferred.reject("该用户不存在，请先注册或者选择手机验证码登录！");
            else
                deferred.reject(err);
        }
      
    });

    return deferred.promise;
}

// 手机号登录，如果用户不存在需要注册一个用户
function getUserOrCreate(query,registerBy) {
    var deferred = Q.defer();
    User.findOne(query)
    .then((user)=>{
        if (user)
        {
            deferred.resolve(user)
        }
        else
        {
            var newUser = new User(Object.assign({state:1, registerBy},query));
            newUser.save(function (err, user) {
                if (err) deferred.reject(err);
                else deferred.resolve(user);
            });
        }
    })
    .catch((error)=>{
        deferred.reject(error);
    })
    return deferred.promise;
}

function changePassword(query, userParam) {
    var deferred = Q.defer();
    User.findOne(query, function (err, user) {
        if (err || !user) {
            if (!user)
                deferred.reject("The user does not exist");
            else
                deferred.reject(err);
        }
        else {
            user.checkPassword(userParam.oldPassword, function (err, isMatch) {
                if (err) {
                    deferred.reject(err);
                }
                else {
                    if (isMatch) {
                        console.log("密码比对成功");
                        // deferred.resolve(  user );
                        user.changePassword(userParam.newPassword, function (err, hashedPssword) {
                            if (err) {
                                deferred.reject(err);
                                return;
                            }
                            console.log("新密码",hashedPssword);
                            User.findOneAndUpdate({_id:user._id}, { password: hashedPssword })
                                .exec(function (err, result) {
                                    if (err) {
                                        deferred.reject(err);
                                    }
                                    else {
                                        deferred.resolve(result);
                                    }
                                })
                        })

                    } else {
                        deferred.reject("密码错误");
                    }
                }
            });
        }
    });
    return deferred.promise;
}

function getUserByQuery( query ,isrefresh)
{
    var deferred = Q.defer();
    if(query._id) query._id = ObjectId(query._id);
    User.find(query)
    .populate({ path: "checker", select: "username"})
    .exec( (err, user) => {
        if (user) {
            if (user && user.length>0 && isrefresh)
            {
                // let userone = JSON.parse(JSON.stringify(user[0]));
                // let result = Object.assign({setting:options.setting},userone);
                deferred.resolve(user);
            }
            else if(user){
                deferred.resolve(user);
            }
            else
            {
                deferred.reject("'can't find this user !");
            }
        }
        else {
            deferred.reject(err);
        }
    })
    return deferred.promise;
}

function getAllByUId(_id) {
    var deferred = Q.defer();

    User.findById(_id)
        .populate({ path: "proj_id", select: { SceneSettigns: 0 } })
        .exec(function (err, user) {
            if (err)
                deferred.reject(err);
            else {
                if (user) {
                    deferred.resolve(user);
                }
                else {
                    // user not found
                    deferred.resolve("查询用户失败");
                }
            }
        });
    return deferred.promise;
}


function updateById(id, param) {
    
    var deferred = Q.defer();
    let option =  {new:true};

    let query = {_id:ObjectId(id)};
    User.findByIdAndUpdate(id,param,option).exec((err, result)=>{
        if(err)
        {
            deferred.reject(err);
        }
        else
        {
            deferred.resolve(result);
        }
    })
    return deferred.promise;
}

function existVerify(query) { 
    var deferred = Q.defer();
    
    User.find(query)
    .exec(( error, result )=>{
        if(error)
        {
            deferred.reject(error);
        }
        else
        {
            deferred.resolve(result);
        }
    })

    return deferred.promise;
}