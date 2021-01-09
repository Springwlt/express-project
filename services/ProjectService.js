const ProjectDao = require('../dao/projectDao');
const UserDao = require('../dao/UserDao');
let userDao = new UserDao();
let projectDao = new ProjectDao();

class ProjectService {
    addCollaborator(req, res) {
        let pid = req.body.pid;
        let user = req.body.user;

        IntoAddCollaborator(pid, user)
            .then(function (data) {
                return data;
            })
            .catch(function (err) {
                return { error: err };
            });
    }

    IntoAddCollaborator(pid, user) {
        let deferred = Q.defer();
        User.findOne({ $or: [{ phone: user }, { email: user }] }, { id: true, email: true, phone: true, _id: false }, function (err, user) {
            if (err) {
                deferred.reject(err);
            }
            else {
                if (user) {
                    // deferred.resolve( user._doc );
                    user._doc.access_level = 'read';
                    Project.updateOne({ id: pid, collaborators: { $not: { $elemMatch: { id: user.id } } } }, { $push: { 'permissions.read': user.id, 'collaborators': user } }, function (err, project) {
                        if (err) {
                            deferred.reject(err);
                        }
                        else {
                            if (project.n !== 0) {
                                deferred.resolve(user._doc);
                            }
                            else {
                                deferred.reject({ "msg": "project not found or collaborator already exists" });
                            }
                        }
                    });
                }
                else {
                    deferred.reject({ "msg": "user not found" });
                }
            }
        });
        return deferred.promise;
    }

    async deleteCollaborator(req, res) {
        let pid = req.body.pid;
        let collaborator = req.body.collaborator;

        IntoDeleteCollaborator(pid, collaborator)
            .then(function (data) {
                res.send(data);
            })
            .catch(function (err) {
                res.send({ error: err });
            });
    }

    IntoDeleteCollaborator(pid, collaborator) {
        let deferred = Q.defer();
        let userIdInteger = parseInt(collaborator.id);
        let pullFilter = { collaborators: { id: userIdInteger } };
        pullFilter['permissions.' + collaborator.access_level] = userIdInteger;
        Project.updateOne({ id: pid }, { $pull: pullFilter }, function (err, project) {
            if (err) {
                deferred.reject(err);
            }
            else {
                if (project) {
                    deferred.resolve(project);
                }
                else {
                    deferred.reject({ "msg": "project not found" });
                }
            }
        });

        return deferred.promise;
    };

    updateCollaboratorAccessLevel(req, res) {
        let pid = req.body.pid;
        let uid = req.body.uid;
        let olevel = req.body.olevel;
        let tlevel = req.body.tlevel;

        IntoUpdateCollaboratorAccessLevel(pid, uid, olevel, tlevel)
            .then(function (data) {
                return data;
            })
            .catch(function (err) {
                return { error: err };
            });
    }

    updateCollaboratorAccessLevel(pid, uid, olevel, tlevel) {
        let deferred = Q.defer();
        let userIdInteger = parseInt(uid);
        let pullFilter = {};
        pullFilter['permissions.' + olevel] = userIdInteger;
        let pushFilter = {};
        pushFilter['permissions.' + tlevel] = userIdInteger;
        Project.updateOne({id:pid}, {$pull:pullFilter, $push:pushFilter, $set: {"collaborators.$[elem].access_level": tlevel}}, 
        {arrayFilters: [{"elem.id": {$eq: userIdInteger}}]}, function ( err, project ) {
            if (err){
                deferred.reject( err );
            }
            else{
                if(project)
                {
                    deferred.resolve( project );
                }
                else
                {
                    deferred.reject({ "msg": "project not found" });
                }
            }
        });
        
        return deferred.promise;
    }
}
module.exports = ProjectService;