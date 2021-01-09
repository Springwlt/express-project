let WebSocket = require("ws");
let common = require("../utils/common")
let ProjectSerIP = common.config.ProjectSerIP;

let wsUrl = ProjectSerIP + '/userServer';
let lockReconnect = false;

let serverClient = {};
var heartCheck = {
    timeout: 60000,//60ms
    timeoutObj: null,
    serverTimeoutObj: null,
    reset: function () {
        clearTimeout(this.timeoutObj);
        clearTimeout(this.serverTimeoutObj);
        this.start();
    },
    start: function () {
        var self = this;
        this.timeoutObj = setTimeout(function () {
            serverClient.server.send(JSON.stringify({ type: "HeartBeat" }));
            self.serverTimeoutObj = setTimeout(function () {
                serverClient.server.close();//如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
            }, self.timeout)
        }, this.timeout)
    },
}

function reconnect() {
    if (lockReconnect) return;
    lockReconnect = true;
    console.log("重新连接...");
    //没连接上会一直重连，设置延迟避免请求过多
    setTimeout(function () {
        createClient(wsUrl);
        console.log("正在重连，当前时间" + new Date())
        lockReconnect = false;
    }, 2000); //这里设置重连间隔(ms)
}

function createClient() {
    var server = new WebSocket(wsUrl);//创建一个连接
    server.on('open', function () {
        // server.send('Hello!我是WS用户服务器的客户端');//发送消息给服务端
        heartCheck.start();
    });
    server.on('error', function (err) {
        // console.log("error",err);
        reconnect();
    });
    server.on('close', function (err) {
        reconnect();
    });
    server.on('message', function (data) {
        heartCheck.reset();
        if (data !== 'HeartBeat' && serverClient.message) {
            serverClient.message(data)
        }
    });
    serverClient.server = server;
}
//createClient();


//发送消息给项目服务器
function sendMesToProServer(str) {
    serverClient.server.send(str);
}


serverClient.send = sendMesToProServer;
serverClient.message = null;
module.exports = serverClient;
