const ProjectDao = require('../dao/projectDao');
const ProjectServerDao = require('../dao/ProjectServerDao');
const AssetServerDao = require('../dao/AssetServerDao');
const UserDao = require('../dao/UserDao');
const ObjectId = require('mongoose').Types.ObjectId;
const common = require('../utils/common');

let projectServerDao = new ProjectServerDao();
let assetServerDao = new AssetServerDao();
let projectDao = new ProjectDao();
let userDao = new UserDao();

class WapPushService {
    async assignServers(req, res) {
        if (!req.headers.authorization || req.headers.authorization.indexOf(' ') === -1) {
            return { error: "no authorization info", result: null };
        }
        let token = req.headers.authorization.split(' ')[1];
        verifyTokenUserExistence(token)
            .then(function (data) {
                console.log(data);
                if (!req.body.editor_version) {
                    return { error: "no editor version found", result: null };
                }
                IntoAssignServers(req.body.editor_version)
                    .then(function (assigned_proj_svr) {
                        return assigned_proj_svr;
                    })
                    .catch(function (err) {
                        return { error: err };
                    });
            })
            .catch(function (err) {
                return { error: err };
            });
    }

    IntoAssignServers(editor_version) {
        let deferred = Q.defer();
        ProjectServer.aggregate([
            { $match: { editor_versions: editor_version } },
            { $project: { max_proj_num: 1, current_proj_num: 1, asset_server_id: 1, address: 1, rest_proj_num: { $subtract: ["$max_proj_num", "$current_proj_num"] } } },
            { $sort: { rest_proj_num: -1 } }, { $limit: 1 }
        ], function (err, data) {
            if (err) {
                deferred.reject(err);
            }
            else {
                let assignedServer = data[0];
                ProjectServer.updateOne({ _id: ObjectId(assignedServer._id) }, { $inc: { current_proj_num: 1 } }, function (err, updateResult) {
                    if (err) {
                        deferred.reject(err);
                    }
                    else {
                        AssetServer.updateOne({ _id: ObjectId(assignedServer.asset_server_id) }, { $inc: { current_proj_num: 1 } }, function (err, assetServerUpdate) {
                            if (err) {
                                deferred.reject(err);
                            }
                            else {
                                deferred.resolve(assignedServer);
                            }
                        });
                    }
                });
            }
        });
        return deferred.promise;
    }

    async unassignServers(req, res) {
        try {
            if (!req.headers.authorization || req.headers.authorization.indexOf(' ') === -1) {
                return { error: "no authorization info", result: null };
            }
            let token = req.headers.authorization.split(' ')[1];
            verifyTokenUserExistence(token)
                .then(function (data) {
                    console.log(data);
                    if (!req.body.project_server_id) {
                        return { error: "no project_server_id found", result: null };
                    }
                    service.unassignServers(req.body.project_server_id)
                        .then(function (unassigned_proj_svr) {
                            return unassigned_proj_svr;
                        })
                        .catch(function (err) {
                            return { error: err };
                        });
                })
                .catch(function (err) {
                    return { error: err };
                });

        } catch (error) {
            return error;
        }
    }

    getServers(req, res) {
        try {
            if (!req.headers.authorization || req.headers.authorization.indexOf(' ') === -1) {
                return { error: "no authorization info", result: null };
            }
            let token = req.headers.authorization.split(' ')[1];
            verifyTokenUserExistence(token)
                .then(function (data) {
                    console.log(data);
                    if (!req.query.project_server_id) {
                        return { error: "no project_server_id found", result: null };
                    }
                    IntoGetServers(req.query.project_server_id)
                        .then(function (servers) {
                            return servers;
                        })
                        .catch(function (err) {
                            return { error: err };
                        });
                })
                .catch(function (err) {
                    return { error: err };
                });
        } catch (error) {
            return error;
        }
    }

    verifyTokenUserExistence(token) {
        try {
            let deferred = Q.defer();
            if (!token) {
                deferred.reject({ "msg": "No query permission" });
            } else {
                let jwt = new common.JWT(token);
                let user = jwt.decodeToken();
                if (user.result) {
                    let uid = user.result.uid;
                    userDao.findOne({ _id: ObjectId(uid) }, function (err, user) {
                        if (err) {
                            deferred.reject(err);
                        }
                        else {
                            if (user) {
                                deferred.resolve(user._doc);
                            }
                            else {
                                deferred.reject({ "msg": "No valid user found, you are an intruder!!!" });
                            }
                        }
                    });
                } else {
                    deferred.reject({ "msg": "No query permission" });
                }
            }
            return deferred.promise;

        } catch (error) {
            return error;
        }
    }

    IntoGetServers(project_server_id) {
        let deferred = Q.defer();
        let servers = {};
        ProjectServer.findOne({ _id: ObjectId(project_server_id) }, function (err, project_server) {
            if (err) {
                deferred.reject(err);
            }
            else {
                servers.project_server_url = project_server.address;
                servers.websocket_url = project_server.websocket_url;
                AssetServer.findOne({ _id: ObjectId(project_server.asset_server_id) }, function (err, asset_server) {
                    if (err) {
                        deferred.reject(err);
                    }
                    else {
                        servers.asset_server_url = asset_server.address;
                        deferred.resolve({ servers });
                    }
                });
            }
        });
        return deferred.promise;

    }
    async getServerInfo(req, res) {
        try {
            let pid = req.query.project;
            if (!pid) {
                return { "code": -1, "msg": "missing parameters" };
            }
            let servers = await service.getServersInfo(pid);
            if (servers.length > 0) {
                return { "code": 1, "msg": "user query", "servers": servers[0] };
            } else {
                return { "code": -1, "msg": "query failed" };
            }
        } catch (error) {
            return { "code": -1, "msg": "query failed", "error": error };
        }
    }

    async getServersInfo(project_server_id) {
        let deferred = Q.defer();
        let projectId = parseInt(project_server_id);
        try {
            let filter = [{
                "$lookup": {
                    "from": "asset_servers",
                    "localField": "asset_server_id",
                    "foreignField": "_id",
                    "as": "asset_servers_docs"
                }
            },
            {
                "$unwind": {
                    "path": "$asset_servers_docs",
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                "$lookup": {
                    "from": "projects",
                    "localField": "_id",
                    "foreignField": "project_server_id",
                    "as": "projects_docs"
                }
            },
            {
                "$match": {
                    "projects_docs.id": projectId
                }
            },
            {
                "$project": {
                    "websocket_url": 1,
                    "project_server_url": "$address",
                    "asset_server_url": "$asset_servers_docs.address",
                    "project_id": "$projects_docs.id"
                }
            }];
            let servers = await projectDao.aggregate(filter);
            deferred.resolve(servers);
        } catch (error) {
            deferred.reject(err);
        }
        return deferred.promise;
    };

    unassignServers(project_server_id) {
        let deferred = Q.defer();

        ProjectServer.updateOne({ _id: ObjectId(project_server_id) }, { $inc: { current_proj_num: -1 } }, function (err, project_server_update) {
            if (err) {
                deferred.reject(err);
            }
            else {
                ProjectServer.findOne({ _id: ObjectId(project_server_id) }, function (err, project_server) {
                    if (err) {
                        deferred.reject(err);
                    }
                    else {
                        AssetServer.updateOne({ _id: ObjectId(project_server.asset_server_id) }, { $inc: { current_proj_num: -1 } }, function (err, asset_server_update) {
                            if (err) {
                                deferred.reject(err);
                            }
                            else {
                                deferred.resolve({ project_server });
                            }
                        });
                    }
                });
            }
        });
        return deferred.promise;
    }
}

module.exports = WapPushService;