const Core = require('@alicloud/pop-core');
const Q = require('q');
const MD5 = require('md5');
let JWT = require('./jwt.verify');
const secret = "ssh-rsa AAAAB3NzaC1yc2EAAAABJQAAAQEAmQ4rjnH/odSZzXGsfMsShEHllnywcFv2cNkt8LighKAp3sFsx/dszq+nNVVlksYss31LbtQFDq79NnvY4cDqORRP6LYVk0SdbcJaipaJl0ppNdDLMtTXJJj8gSjXDLb2otbVhtIVo0Pv2XoF1iBX1pcLF8qp4TwZV3ZPjuO1AtADA+CBcSAA/RKyJzMFCizUOphjl+L34E8vrqYd/d054LIzhVoX2aarARucAosXeNrKNXyI5BKQ8EhNcx+liNJTZUITvl/s3ecJ/V2HKAZhCZgn5Nk8rDhAZAgEUQQAyCS2aIfxwOg0MncerZM2tiHEIbpzKjtpmUCcb6z1q3NHsw== rsa-key-20190412";

var client = new Core({
  //accessKeyId: 'LTAI4Fnq6vkBMys71azmxjzh',
  //accessKeySecret: 'OdYbh3CRJhNygVQxAh1hYyU2p4XOXQ',
  accessKeyId: 'LTAI4FniZZyESkV1dtmnYHDx',
  accessKeySecret: 'MgwA9oaFABRfsH8L88Fm1vy5N4ZVlY',
  endpoint: 'https://dysmsapi.aliyuncs.com',
  apiVersion: '2017-05-25'
});

var defultParams = {
  "RegionId": "cn-hangzhou",
  "PhoneNumbers": "17621491410",
  "SignName": "Web3D引擎",
  "TemplateCode": "SMS_186597789",
  "TemplateParam": "{\"code\":\"1546\"}"
}

var requestOption = {
  method: 'POST'
};

function getCode () { 
	return Math.floor(Math.random() * (999999 - 100000) + 100000);
 }


function sendCode(params) {
    var deferred = Q.defer();

    let code = getCode();

    let defultParams = {
        "RegionId": "cn-hangzhou",
        "PhoneNumbers": "",
        "SignName": "Web3D引擎",
        "TemplateCode": "SMS_186597789",
        "TemplateParam": '{"code":'+ code +'}'
    }

    let param = Object.assign( defultParams, params )
    
    if (!param.PhoneNumbers || param.PhoneNumbers == ''){
        deferred.reject('请传入有效的电话号码');
        return deferred.promise;
    }

    // param.TemplateParam = '{"code":'+ code +'}'
    console.log("----phone----接收到的参数：",param )
    client.request('SendSms', param, requestOption).then((result) => {
        console.log(JSON.stringify(result));
        deferred.resolve(Object.assign({newCode: code},result));
    }, (ex) => {
        console.log(ex);
        deferred.reject(ex);
    })

    return deferred.promise;
}

/* {
  setTimeout(()=>{
    let code = getCode();
    let token = getToken(code,'15009564625');
    let verifyRes = verifyToken(token,code)
    console.log("-----code --- ",code);
    console.log("-----token--- ",token);
    console.log("-----verifyRes--- ",verifyRes);
  },5000)
} */

function getToken (code,other) {
  let jwt = new JWT(Object.assign(other,{newCode: MD5(code+secret)}));
  return jwt.generateToken(60*5);
}

function verifyToken(token,code) {  

  let jwt = new JWT(token);
  let ver = jwt.verifyToken();
  if(ver.error)
  {
    return false;
  }
  if (ver.result)
  {
      let {newCode} = ver.result;
      let verifyCode =  MD5(code+secret);
      console.log("-------newCode---------",newCode);
      console.log("-------verifyCode---------",verifyCode);
      if (newCode == verifyCode)
      {
          return true;
      }
      return false;
    }

}

module.exports = {
  send: sendCode,
  getToken,
  verifyToken 
}