const fs = require('fs');
const path = require('path');

global.mapobj = {};
global.MAX_DATA_LIMIT = 500;//单次查询数据最大量
global.MAX_SAMPLE = 1000;//单次随机查询 初始最大量
global.MAX_DELETE = 1000;//单次删除 初始最大量[暂定1000，超过此数，请测试是否会造成node的内存溢出]

const conffile = path.join(__dirname, 'config.json');
const confjson = JSON.parse(fs.readFileSync(conffile, 'utf8'));
const config = confjson;
const ENV = process.env.NODE_ENV;
if (!ENV){
    ENV = 'development';
}

module.exports = config[ENV];

