const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');
const userController = new UserController();
const common = require('../utils/common');

//测试通过
router.post('/signup/email', function (req, res, next) {
  userController.registerByEmail(req, res, next, {});
});

//测试通过
router.post('/signup/phone', function (req, res, next) {
  userController.registerByPhone(req, res, next, {});
});

//测试通过
router.get('/signup/getVerifyCode', function (req, res, next) {
  userController.getVerifyCode(req, res, next, {});
});

//测试通过，密码对比方式需要进一步测试
router.post('/login/email', function (req, res, next) {
  userController.loginByEmail(req, res, next, {});
});

//测试通过，密码对比方式需要进一步测试
router.post('/login/phone', function (req, res, next) {
  userController.loginByPhone(req, res, next, {});
});

//测试通过
router.post('/login/phone/verifyCode', function (req, res, next) {
  userController.loginByVerifyCode(req, res, next, {});
});

//测试通过
router.get('/login/getVerifyCode', function (req, res, next) {
  userController.getLoginVerifyCode(req, res, next, {});
});

//测试通过
router.get('/getUserById', function (req, res, next) {
  userController.getUserById(req, res, next, {});
});

//测试通过,时间允许可以进一步优化
router.post("/saveAccountInfo",function (req, res, next) {
  userController.saveAccountInfo(req, res, next, {});
});

//这种没经过token认证的修改密码的方式已废弃
router.post("/changePassword",function (req, res, next) {
  userController.changePassword(req, res, next, {});
});

//
router.get('/authorityExtent', function (req, res, next) {
  userController.authorityExtent(req, res, next, {});
});

//测试通过
router.post('/uploadSourceFile', common.multer({ storage : common.storage_file}).single("qqfile"),function (req, res, next) {
  userController.uploadSourceFile(req, res, next, {});
});

//此方法没有实现体，测试通过
router.get("/users/:uid/thumbnail",function(req, res, next, {}){
  let filePath = '';
  console.log("请求加载图片：", req.params);
});

module.exports = router;
