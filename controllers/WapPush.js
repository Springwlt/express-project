const WapPushService = require('../services/WapPushService');
const wapPushService = new WapPushService();

class WapPush {
    async assignServers(req, res, next) {
        try {
            let pid = req.body.pid;
            let user = req.body.user;
            wapPushService.assignServers(pid, user).then((data) => {
                return res.send(data);
            });
        } catch (error) {
            console.log('create error--> ', error);
            return res.send(error);
        }
    }

    async unassignServers(req, res, next) {
        try {
            wapPushService.unassignServers(req).then((data) => {
                return res.send(data);
            });
        } catch (error) {
            console.log('create error--> ', error);
            return res.send(error);
        }
    }

    async getServers(req, res, next) {
        try {
            
            wapPushService.getServers(req).then((data) => {
                return res.send(data);
            });
        } catch (error) {
            console.log('create error--> ', error);
            return error;
        }
    }

    async getServerInfo(req, res, next) {
        try {
            wapPushService.getServerInfo(req).then((data) => {
                return res.send(data);
            });
        } catch (error) {
            console.log('create error--> ', error);
            return error;
        }
    }
}

module.exports = WapPush;