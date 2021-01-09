# cloud project server

一、基础分层目录

dao：数据访问层，与底层 MySQL、MongoDB 进行数据交互，设置连接池等配置

schemas(models(也可以): 系统数据结构定义    Model即模型,常常和持久化的数据一一对应，Model承载的作用就是数据的抽象，描述了一个数据的定义，Model的实例就是一组组的数据。

service: Service的重点是在于提供服务，可以处理事务和业务逻辑。

controllers:  controller是控制中心，所有的指令，调度都从这里发出去。与service交互，只负责调用服务，不负责业务逻辑处理。

routes: 自定义路由(web)

二. log日志存放目录

logs：log生成目录的存放地址或用户数据

三. 单元测试脚本

tests: 测试脚本

四. 为V3阶段渲染烘焙预留目录

tools：渲染工具存放目录

tmp: 临时文件，用于存储渲染结果

五.脚本存放目录

daemons:  需要后台运行的进程(比如定时任务)

redis: redis文件,对redis的操作脚本

shell: 命令行脚本

六.编辑器，前端存储文件目录

files: 编辑器存储的资源文件

public: 发布出来的项目存储目录


七. node第三方包及其对包引用的封装

utils: 公用库+ 工具库

node_modules: node模块

八.  vscode调试参数示例

```
{
    "version": "0.2.0",
    "configurations": [
        {
            "env": {
                "NODE_ENV": "test"
             },
            "type": "node",
            "request": "launch",
            "name": "Launch Program",
            "program": "D:/express-project/server.js",
            "runtimeExecutable": "D:/tool/node/node"
        }
    ]
}
```

## 项目运行方式
- 方式一
NODE_ENV=环境变量
```
    NODE_ENV=test node ./server.js
```

- 方式二
NODE_ENV=环境变量
```
  npm run startpm2
```

- 方式三
NODE_ENV=环境变量
```
  pm2 start startup.json
```






