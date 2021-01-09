const BaseDao = require('./BaseDao');
// 导入对应的实体
const User = require('../models/user.model');
const common = require('../utils/common');

class UserDao extends BaseDao {
  constructor() {
    super(User);
  }
  //如果有啥特殊需求的话，自己再重写方法咯
  async create(obj) {
    let entity = new this.Model(obj);
    try {
      let dao = await this.Model.create(entity);
      console.log('create result--> ', dao);
      return dao;
    } catch (error) {
      console.log('create error--> ', error);
      return error;
    }
  }
}

module.exports = UserDao;