const express = require('express');
const router = express.Router();
const WapPushController = require('../controllers/WapPush');
const wapPushController = new WapPushController();

//完成
router.post("/assignServers", function (req, res, next) {
    wapPushController.assignServers(req, res, next, {});
});

//完成
router.post("/unassignServers", function (req, res, next) {
    wapPushController.unassignServers(req, res, next, {});
});

//完成
router.post("/getServers", function (req, res, next) {
    wapPushController.getServers(req, res, next, {});
});

//完成
router.post("/getServerInfo", function (req, res, next) {
    wapPushController.getServerInfo(req, res, next, {});
});


module.exports = router;