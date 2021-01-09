const UserService = require('../services/UserService');
const userService = new UserService();

class User {
  async getUserList(req, res, next) {
    try {
      userService.getUserList().then((data) => {
        res.json({
          code: 0,
          msg: 'OK',
          data: data
        })
      }).catch
    } catch (error) {
      console.log('create error--> ', error);
      return error;
    }
  }

  async registerByEmail(req, res, next) {
    try {
      userService.registerByEmail(req).then((data) => {
        return res.send(data);
      })
    } catch (error) {
      console.log('create error--> ', error);
      return res.send(error);
    }
  }

  async loginByEmail(req, res, next) {
    try {
      userService.loginByEmail(req).then((data) => {
        let token = data.token;
        res.header('Authenticate', token);
        return res.send(data);
      });
    } catch (error) {
      console.log('create error--> ', error);
      return res.send(error);
    }
  }

  async loginByPhone(req, res, next) {
    try {
      userService.loginByPhone(req).then((data) => {
        let token = data.token;
        res.header('Authenticate', token);
        return res.send(data);
      });
    } catch (error) {
      console.log('create error--> ', error);
      return res.send(error);
    }
  }

  async registerByPhone(req, res, next) {
    try {
      userService.registerByPhone(req).then((data) => {
        let token = data.token;
        res.header('Authenticate', token);
        return res.send(data);

      });


    } catch (error) {
      console.log('create error--> ', error);
      return res.send(error);
    }
  }

  async getVerifyCode(req, res, next) {
    try {
      userService.getVerifyCode(req).then((data) => {
        return res.send(data);
      }).catch
    } catch (error) {
      console.log('create error--> ', error);
      return res.send(error);
    }
  }

  async loginByVerifyCode(req, res, next) {
    try {
      userService.loginByVerifyCode(req).then((data) => {
        return res.send(data);
      });
    } catch (error) {
      console.log('create error--> ', error);
      return res.send(error);
    }
  }

  async getLoginVerifyCode(req, res, next) {
    try {
      userService.getLoginVerifyCode(req).then((data) => {
        return res.send(data);
      });
    } catch (error) {
      console.log('create error--> ', error);
      return res.send(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      userService.getUserById(req).then((data) => {
        return res.send(data);
      });
    } catch (error) {
      console.log('create error--> ', error);
      return res.send(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      userService.changePassword(req).then((data) => {
        return res.send(data);
      });
    } catch (error) {
      console.log('create error--> ', error);
      return res.send(error);
    }
  }

  async saveAccountInfo(req, res, next) {
    try {
      userService.saveAccountInfo(req).then((data) => {
        return res.send(data);
      });
    } catch (error) {
      console.log('create error--> ', error);
      return res.send(error);
    }
  }

  async authorityExtent(req, res, next) {
    try {
      userService.authorityExtent(req).then((data) => {
        return res.send(data);
      });
    } catch (error) {
      console.log('create error--> ', error);
      return res.send(error);
    }
  }

  uploadSourceFile(req, res, next) {
    try {
      return res.send({code:1, msg:"成功"});
    } catch (error) {
      console.log('create error--> ', error);
      return res.send(error);
    }
  }

}

module.exports = User;