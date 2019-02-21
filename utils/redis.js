/**
 * Created by Administrator on 2019/2/20.
 */

const redis = require('redis');
const { promisify } = require('util');
const redisconf  = require( '../config/redis' );

let client = redis.createClient(redisconf);
const getAsync = promisify(client.get).bind(client);

//expires seconds
function set(key, value, expires) {
    var res = client.set(key, value, 'EX', expires);
    return res;
}

function get(key) {
    return getAsync(key);
}

function quit() {
    client.quit();
}

module.exports = {
    client: client,
    set: set,
    get: get,
    quit: quit
};