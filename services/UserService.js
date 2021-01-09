const UserDao = require('../dao/UserDao');
const ObjectId = require('mongoose').Types.ObjectId;
const common = require('../utils/common');

let userDao = new UserDao();

class UserService {
  async registerByEmail(req, res) {
    let _id = ObjectId();
    let user = Object.assign({ _id: _id, state: 0 }, req.body);
    if (!user.email) {
      return { error: '请传入如有效的email', result: null };
    };
    let jwt = new common.JWT({ uid: user._id, email: user.email });
    let token = jwt.generateToken();
    console.log("有数据吗：", req.body);

    let userData = await userDao.findOne({ email: user.email });
    if (userData) {
      return { error: "该用户已存在：" + user.email };
    };

    let resu = "";//await common.email.comfirmEmail(user.username, token, user.email);
    console.log("邮件发送成功了吗？", resu);
    user.registerBy = 3;
    let getHashedPssword = await common.hashedPssword(user.password);
    if (getHashedPssword.code != 1) {
      return { error: "密码错误" };
    };
    user.password = getHashedPssword.hashedPssword;
    let result = await userDao.create(user);
    if (result) {
      console.log("注册成功：", result.username);
      return { error: null, result: { username: result.username, _id: result._id, token: token } };
    } else {
      console.log("报错：", err);
      return { error: err, result: null, status: 0 };
    }
  }

  async loginByEmail(req, res) {
    let { email, password } = req.body;
    email = email.replace(/^\s*|\s*$/g, "");
    console.log("登录：", email, password);
    if (!email || !password) {
      return { error: "登录信息不完善，请检查数据", result: null };
    };
    let user = await userDao.findOne({ email: email });
    if (!user) {
      return "该用户不存在，请先注册或者选择手机验证码登录！";
    };
    let compare = await common.compare(password, user.password);
    if (compare.code != 1) {
      return { error: "密码错误" };
    }
    if (user && user.state == 1) {
      let jwt = new common.JWT({ uid: user._id, email: user.email });
      let token = jwt.generateToken();
      console.log("登陆成功: ", token);
      let user_config = {
        name: user.username,
        user: { username: user.username, id: user.id },
        token: token,
        userServer: req.headers.origin
      };
      delete user._doc.password;
      if (common.config.internalTestUsers.includes(user.id.toString())) {
        let own_editor_version = ["V1.0.0_Alpha", "V1.1.0_Alpha", "V1.1.2_Alpha"];
        return { error: null, result: user, token: token, state: 1, "user_config": user_config, "own_editor_version": own_editor_version };
      } else {
        let own_editor_version = ["V1.0.0_Alpha", "V1.1.0_Alpha"];
        return { error: null, result: user, token: token, state: 1, "user_config": user_config, "own_editor_version": own_editor_version };
      }
    }
    else if (user && user.state == 2) {
      return { error: "该账号是封号状态，具体情况请联系管理员", state: 2, result: null };
    }
    else {
      let jwt = new common.JWT({ uid: user._id, email: user.email });
      let token = jwt.generateToken();
      return { error: "该账号还未验证，请前往验证", state: 0, result: null, token: token };
    }
  }

  async registerByPhone(req, res) {
    let { token } = req.body;
    let user = req.body;
    delete user.token;
    let jwt = new common.JWT(token);
    let ver = jwt.verifyToken();
    if (ver.error) {
      return { error: '验证码已过期或操作不合法', result: null };
    }
    if (!user.phone) {
      return { error: '请传入如有效的phone number', result: null };
    }
    user.registerBy = 1;
    user.state = 1;
    let result = await userDao.findAll({ phone: user.phone });
    if (result && result.length > 0) {
      return { error: "该用户已存在：" + user.phone };
    };
    let getHashedPssword = await common.hashedPssword(user.password);
    if (getHashedPssword.code != 1) {
      return { error: "密码错误" };
    };
    user.password = getHashedPssword.hashedPssword;
    let resus = await userDao.create(user);

    if (resus) {
      console.log("注册成功：", resus.username);
      let jwt = new common.JWT({ uid: resus._id, phone: resus.phone });
      let token = jwt.generateToken();
      return { error: null, result: { phone: resus.phone, _id: resus._id, token: token } };
    } else {
      console.log("报错：", err);
      return { error: err, result: null };
    }
  }

  async getVerifyCode(req, res) {
    let { phone } = req.query;
    let users = await userDao.findAll({ phone: phone });
    if (users && users.length > 0) {
      console.log("验证该数据存在:", { phone }, users)
      return { error: "该手机号已经注册，请直接前往登录！", result: null };
    };
    let result = await common.phoneCode.send({ "PhoneNumbers": phone, "TemplateCode": "SMS_186597789" });
    let { Code } = result;
    if (Code === 'OK') {
      console.log(result)
      let token = common.phoneCode.getToken(result.newCode, { phone });
      return { error: null, result: 'OK', token };
    }
  }

  async loginByPhone(req, res) {
    let { phone, password } = req.body;
    phone = phone.replace(/^\s*|\s*$/g, "");    // 去除前后空格
    if (!phone || !password) {
      return { error: "登录信息不完善，请检查数据", result: null };
    };

    let user = await userDao.findOne({ phone: phone });
    if (!user) {
      return { "msg": "该用户不存在，请先注册或者选择手机验证码登录！" };
    };
    let compare = await common.compare(password, user.password);
    if (compare.code != 1) {
      return { error: "密码错误" };
    };
    delete user._doc.password;
    if (user && user.state == 2) {
      return { error: "该账号是封号状态，具体情况请联系管理员", state: 2, result: null };
    } else {
      let jwt = new common.JWT({ uid: user._id, phone: user.phone });
      let token = jwt.generateToken();
      console.log("登陆成功: ", token);
      let user_config = {
        name: user.username,
        user: { username: user.username, id: user.id },
        token: token,
        userServer: req.headers.origin
      }
      //res.header('Authenticate', token);
      //不同身份的用户，编辑器可见版本不同
      if (common.config.internalTestUsers.includes(user.id.toString())) {
        let own_editor_version = ["V1.0.0_Alpha", "V1.1.0_Alpha", "V1.1.2_Alpha"];
        return { error: null, result: user, token: token, state: 1, "user_config": user_config, "own_editor_version": own_editor_version };
      } else {
        let own_editor_version = ["V1.0.0_Alpha", "V1.1.0_Alpha"];
        return { error: null, result: user, token: token, state: 1, "user_config": user_config, "own_editor_version": own_editor_version };
      }
    }
  }

  /* 
    status: 0， 代表注册报错
    status: 1， 代表该用户已经注册了，但是验证码发送失败
  */
  async loginByVerifyCode(req, res) {
    debugger
    let { phone, token } = req.body;
    phone = phone.replace(/^\s*|\s*$/g, "");   // 去除前后空格
    if (!phone || !token) {
      return { error: "登录信息不完善，请检查数据", result: null };
    };
    let jwt = new common.JWT(token);
    let ver = jwt.verifyToken();
    if (ver.error) {
      return { error: '验证码已过期或操作不合法', result: null };
    };

    let user = await userDao.findAndModify({ phone: phone }, { loginAt: Date.now() });
    if (Object.keys(user).length > 0) {
      console.log("更新登录时间：", err, res);
    } else {
      deferred.reject("该用户不存在，请先注册或者选择手机验证码登录！");
    };

    if (user && user.state == 2) {
      return { error: "该账号是封号状态，具体情况请联系管理员", state: 2, result: null };
    }
    else {
      let jwt = new common.JWT({ uid: user._id, phone: user.phone });
      let token = jwt.generateToken();
      console.log("登陆成功: ", token);
      return { error: null, result: user, token: token };
    }

  }

  async getLoginVerifyCode(req, res) {
    let { phone } = req.query;
    if (!phone) {
      return { error: "请传入正确的电话号码", result: null };
    }
    phone = phone.replace(/^\s*|\s*$/g, "");     // 去除前后空格
    let user = await userDao.findAndModify({ phone: phone }, { loginAt: Date.now() });
    if (user) {
      console.log("更新登录时间：");
      let result = await common.phoneCode.send({ "PhoneNumbers": phone, "TemplateCode": "SMS_186597789" });
      let { Code } = result;
      if (Code === 'OK') {
        console.log(result)
        let token = common.phoneCode.getToken(result.newCode, { phone });
        return { error: null, result: 'OK', token };
      }
    } else {
      console.log("该用户不存在，请先注册或者选择手机验证码登录！");
    };
  }


  async getUserById(req, res) {
    let token = req.headers.token || req.query.token;
    if (!token) {
      return { error: "用户未登录", result: null };
    }
    let jwt = new common.JWT(token);
    let ver = jwt.verifyToken();
    let id = req.query.uid;
    console.log("用户ID：", id);
    if (ver.result) {
      let user = await userDao.findOne({ "id": id }, { password: false });
      return user;
    }
    else {
      console.log("refresh 验证失败：", ver);
      return ver;
    };
  }


  async changePassword(req, res) {
    return { error: "此方法已经废弃。" };
    let uid = req.body.uid;
    let passwords = req.body.passwords;
    let query = { id: uid };
    let [err, user] = await userDao.findOne(query).then(data => [null, data]).catch(err => [err, null]);
    if (err) {
      return err;
    } else {
      if (user.hasOwnProperty('_doc')) {
        let compare = await common.compare(passwords.oldPassword, user.password);
        if (compare.code != 1) {
          return { error: "密码错误" };
        };
        let result = await common.hashedPssword(passwords.newPassword);
        if (result.code != 1) {
          return { error: "密码错误" };
        };
        let hashedPssword = result.hashedPssword;
        let date = await userDao.updateOne(query, { $set: { password: hashedPssword } });
        return date._doc;
      } else {
        return {};
      }
    }
  }

  async saveAccountInfo(req, res) {
    let token = req.headers.token || req.query.token;
    if (!token) {
      return { error: "用户未登录", result: null };
    };
    let id = req.body.uid;
    let updateData = req.body.info;
    let jwt = new common.JWT(token);
    let ver = jwt.verifyToken();
    if (ver.result) {
      if (updateData.hasOwnProperty('password')) {
        delete updateData.password;
      };
      let query = { id: id };
      let [err, user] = await userDao.findAndModify(query, updateData).then(data => [null, data]).catch(err => [err, null]);
      if (err) {
        return err;
      } else {
        if (user.hasOwnProperty('_doc')) {
          delete user._doc.password;
        };
        return user;
      }
    }
    else {
      console.log("refresh 验证失败：", ver);
      return ver;
    };
  }

  async authorityExtent(req, res) {
    let token = "";
    let headersInfo = req.query.headersInfo;
    let pid = req.query.project;
    if (!headersInfo) {
      return { "code": -1, "msg": "No query permission" };
    } else {
      try {
        let tokenUser = await cookieAnalysis(headersInfo);
        if (tokenUser) {
          let tokenUserId = tokenUser.id;
          delete tokenUser.password;
          let project = await common.axios.get(`${common.config.projectServer}/getProjectById?pid=${pid}`);
          let userId = project.data.owner_id;
          let servers = await common.getServersInfo(pid);
          if (servers.code != 1) {
            return { error: "密码错误" };
          };
          if (tokenUserId == userId) {
            let result = {
              "token": token,
              "user": tokenUser,
              "project": project.data,
              "servers": servers[0]
            };
            return { "code": 1, "msg": "user query", data: result };
          } else if (common.config.admin.includes(tokenUserId.toString())) {
            let result = {
              "token": token,
              "user": tokenUser,
              "project": project.data,
              "servers": servers[0]
            };
            return { "code": 1, "msg": "administrator query", data: result };
          } else if (project.data.collaborators.filter(c => c.id === tokenUserId).length > 0) {
            let result = {
              "token": token,
              "user": tokenUser,
              "project": project.data,
              "servers": servers[0]
            };
            return { "code": 1, "msg": "collaborator query", data: result };
          } else {
            return { "code": -1, "msg": "No query permission" };
          }
        }
        else {
          return { "code": -1, "msg": "No query permission" };
        };
      } catch (error) {
        return { "code": -1, "msg": "No query permission" };
      }
    }
  }

  async cookieAnalysis(headersInfo) {
    let deferred = Q.defer();
    let token = "";
    try {
      let cookies = headersInfo.split("userInfos=[")[1].split(",");
      if (!headersInfo) {
        return { "msg": "No query permission" };
      } else {
        for (cookie of cookies) {
          if (cookie.includes("token")) {
            token = cookie.split(":")[1].replace(/^[\'\"]+|[\'\"]+$/g, "");
            break;
          }
        };
        if (!token) {
          deferred.reject({ "msg": "No query permission" });
        };
        if (token.includes('"}]')) {
          token = token.replace('"}]', "");
        };
        if (token.includes('"}')) {
          token = token.replace('"}', "");
        };
        if (token.includes(";")) {
          token = token.split(";")[0];
        };
        let jwt = new common.JWT(token);
        let user = jwt.decodeToken();
        if (user.result) {
          let uid = user.result.uid;
          let user = await userDao.findOne({ _id: ObjectId(uid) }, { password: -1 });
          deferred.resolve(user._doc);
        } else {
          deferred.reject({ "msg": "No query permission" });
        }
      }
    } catch (error) {
      deferred.reject({ "msg": "No query permission" });
    }
    return deferred.promise;

  }

  async getUserInfoById(req, res) {
    try {
      let user = await userDao.findOne({ id: uid }, { password: -1 });
      return user;
    } catch (error) {
      return;
    }
  }

  async updateUserById(id, updateData) {
    try {
      if (updateData.hasOwnProperty('password')) {
        delete updateData.password;
      }

      let deferred = Q.defer();

      let query = { id: id };

      userDao.findOneAndUpdate(query, updateData, function (err, user) {

        if (err) {
          deferred.reject(err);
        }
        else {
          deferred.resolve(user);
        }
      })

      return deferred.promise;


    } catch (error) {
      return;
    }
  }

}
module.exports = UserService;