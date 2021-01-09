const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/project');
const projectController = new ProjectController();

//完成
router.post("/addCollaborator", function (req, res, next) {
    projectController.addCollaborator(req, res, next, {});
});

router.post("/deleteCollaborator", function (req, res, next) {
    projectController.deleteCollaborator(req, res, next, {});
});

router.post("/updateCollaboratorAccessLevel", function (req, res, next) {
    projectController.updateCollaboratorAccessLevel(req, res, next, {});
});

module.exports = router;
