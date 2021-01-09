const ProjectService = require('../services/ProjectService');
const projectService = new ProjectService();

class Project {
    async addCollaborator(req, res, next) {
        try {
            projectService.addCollaborator(req).then((data) => {
                return res.send(data);
            });
        } catch (error) {
            console.log('create error--> ', error);
            return res.send(error);
        }
    }

    async deleteCollaborator(req, res, next) {
        try {
            projectService.deleteCollaborator(req).then((data) => {
                let token = data.token;
                res.header('Authenticate', token);
                return res.send(data);
            });
        } catch (error) {
            console.log('create error--> ', error);
            return res.send(error);
        }
    }

    async updateCollaboratorAccessLevel(req, res, next) {
        try {
            projectService.updateCollaboratorAccessLevel(req).then((data) => {
                res.json({
                    code: 0,
                    msg: 'OK',
                    data: data
                })
            });
        } catch (error) {
            console.log('create error--> ', error);
            return error;
        }
    }
}

module.exports = Project;