const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');
const cors = require('cors');
const app = express();
const domain = require('domain');
const ejs = require('ejs');
const myParser = require('body-parser');
const common = require('./utils/common');
const serverClient = require("./services/serverClient");
const UserService = require("./services/UserService");
const port = common.config.port || 3000;
console.log('current NODE_ENV is：%s', process.env.NODE_ENV);

common.emitter.setMaxListeners(0);  //或者关闭最大监听阈值
const userService = new UserService();

app.set("views", "./views");
app.set("view cache", true);
app.engine('html', ejs.__express);
app.set("view engine", "html");

app.use(cors({ credentials: true }));
app.use(myParser.json());
app.use(myParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//跨域处理
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Authorization,content-type,Content-Length');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// 使用 domain 来捕获大部分异常
app.use(function (req, res, next) {
  var reqDomain = domain.create();
  reqDomain.on('error', function (err) {
    console.log(err.stack);
    try {
      res.sendStatus(500);
    } catch (e) {
      console.log('error when exit', e.stack);
    }
  })

  reqDomain.run(next);
});

// uncaughtException 避免程序崩溃
process.on('uncaughtException', function (err) {
  console.log('Uncaught Exception...');
  console.log(err.stack);
});

//路由列表
app.use('/', indexRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

app.listen(port, () => {
  console.log(`App listening at port: ` + port);
});

/*
* 监听收到的来自项目服务器的消息
* */
serverClient.message = function (data) {
  let message = data;
  try {
    message = JSON.parse(data);
  }
  catch (e) {
    message = data;
  }

  switch (message.type) {
    case 'getUserSetting':
      getUserSetting(message.id, message);
      break;
    case 'updateUserSetting':
      updateUserSetting(message.id, message);
      break;
    default:
      break;
  }
};

function sendMesToProServer(err, type, data) {
  if (err) {
    serverClient.send(JSON.stringify({ type: type, error: err.name ? (err.name + ':' + err.message) : err }));
  }
  else {
    serverClient.send(JSON.stringify({ type: type, data: data }));
  }
}

function getUserSetting(uid, mess) {

  userService.getUserInfoById(uid, mess)
    .then(function (user) {
      sendMesToProServer(false, 'getUserSetting', { setting: { ide: user.ide, editor: user.editor }, data: mess });
    })
    .catch(function (err) {
      sendMesToProServer(err);
    })
}

function updateUserSetting(id, message) {
  let updateData = message.data;
  service.updateUserById(id, updateData)
    .then(function (data) {
      console.log("更新成功：", data);
    })
    .catch(function (err) {
      console.log("更新usersetting失败：", err);
    })
}

module.exports = app;
