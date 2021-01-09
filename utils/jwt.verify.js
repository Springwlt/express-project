const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const secret = "ssh-rsa AAAAB3NzaC1yc2EAAAABJQAAAQEAmQ4rjnH/odSZzXGsfMsShEHllnywcFv2cNkt8LighKAp3sFsx/dszq+nNVVlksYss31LbtQFDq79NnvY4cDqORRP6LYVk0SdbcJaipaJl0ppNdDLMtTXJJj8gSjXDLb2otbVhtIVo0Pv2XoF1iBX1pcLF8qp4TwZV3ZPjuO1AtADA+CBcSAA/RKyJzMFCizUOphjl+L34E8vrqYd/d054LIzhVoX2aarARucAosXeNrKNXyI5BKQ8EhNcx+liNJTZUITvl/s3ecJ/V2HKAZhCZgn5Nk8rDhAZAgEUQQAyCS2aIfxwOg0MncerZM2tiHEIbpzKjtpmUCcb6z1q3NHsw== rsa-key-20190412";
const User = require('../models/user.model');

// 创建 token 类
class Jwt {
    constructor(data) {
        this.data = data;
    }
    //生成token
    generateToken(seconds = 60*60*24) {
        let data = this.data;
        // let created = Math.floor(Date.now() / 1000);
        // let cert = fs.readFileSync(path.join(__dirname, '../pem/ca-cert.pem'));//私钥 可以自己生成
        var token = jwt.sign(data, 
            secret, 
            {
            expiresIn:seconds // 一天
        });
        return token;
    }

    // 校验token
    verifyToken() {
        let token = this.data;
        // let cert = fs.readFileSync(path.join(__dirname, '../pem/ca-cert.pem'));//公钥 可以自己生成
        let res;
        try {
             const payload = jwt.verify(token, secret);
             res = {error:null, result: payload};
        } catch (e) {
             res = {error:{name:e.name,message:e.message,expiredAt:e.expiredAt}, result: null};
        }
        return res;
    }

    verifyAdminToken(){
        let token = this.data;
        // let cert = fs.readFileSync(path.join(__dirname, '../pem/ca-cert.pem'));//公钥 可以自己生成
        let res;
        try {
             const payload = jwt.verify(token, secret);
             if ( payload )
             {
                User
             }
             res = {error:null, result: payload};
        } catch (e) {
             res = {error:{name:e.name,message:e.message,expiredAt:e.expiredAt}, result: null};
        }
        return res;
    }

    
    decodeToken(){
        let token = this.data;
        // let cert = fs.readFileSync(path.join(__dirname, '../pem/ca-cert.pem'));//公钥 可以自己生成
        let res;
        try {
             const payload = jwt.decode(token);
             if ( payload )
             {
                User
             }
             res = {error:null, result: payload};
        } catch (e) {
             res = {error:{name:e.name,message:e.message,expiredAt:e.expiredAt}, result: null};
        }
        return res;
    }
}

module.exports = Jwt;