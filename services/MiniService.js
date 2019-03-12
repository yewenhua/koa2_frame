/**
 * Created by Administrator on 2019/2/20.
 */

import xml2js from 'xml2js';
import request from 'superagent';
import redis from '../utils/redis';
import CryptoJS from 'crypto-js';

const _ = require("lodash");
const logUtil = require('../utils/LogUtil');

class MiniService {
    static async parseXML2Json(xml) {
        return new Promise((resolve, reject) => {
            xml2js.parseString(xml, { trim: true, explicitArray: false, ignoreAttrs: true }, function (err, result) {
                if (err) {
                    return reject(err)
                }
                resolve(result.xml)
            })
        })
    }

    static async accessToken(apppId, appSecret) {
        // await ……
        let str = 'miniAccesstoken' + apppId;
        let key = CryptoJS.SHA1(str).toString();
        let cacheValue = await redis.get(key);
        let now = (new Date()).getTime()/1000;
        if(!cacheValue || (JSON.parse(cacheValue)).expire_time < now) {
            let url = 'https://api.weixin.qq.com/cgi-bin/token';
            let rtnData = await request.get(url)
                .query({grant_type: 'client_credential'})
                .query({appid: apppId})
                .query({secret: appSecret});

            if (rtnData.status == 200 && rtnData.text) {
                let rtn = JSON.parse(rtnData.text);
                logUtil.logDebug('MINIACCESSTOKEN==>' + rtn.access_token);
                let cache = {
                    expire_time: (new Date()).getTime() / 1000 + 6000,
                    access_token: rtn.access_token
                };
                redis.set(key, JSON.stringify(cache), 6000);
                return rtn.access_token;
            }
            else {
                return null;
            }
        }
        else{
            let cache = JSON.parse(cacheValue);
            return cache.access_token;
        }
    }

    static async openidAndSessionkey(apppId, appSecret, code) {
        let url = 'https://api.weixin.qq.com/sns/jscode2session';
        let rtnData = await request.get(url)
            .query({grant_type: 'authorization_code'})
            .query({js_code: code})
            .query({appid: apppId})
            .query({secret: appSecret});

        if (rtnData.status == 200 && rtnData.text) {
            let rtn = JSON.parse(rtnData.text);
            logUtil.logDebug('openidAndSessionkey==>' + rtnData.text);
            return rtn;
        }
        else {
            return null;
        }
    }

    static async raw(args){
        let keys = Object.keys(args);
        keys = keys.sort()
        let newArgs = {};
        keys.forEach(function (key) {
            newArgs[key.toLowerCase()] = args[key];
        });

        let string = '';
        for (let k in newArgs) {
            string += '&' + k + '=' + newArgs[k];
        }
        string = string.substr(1);
        return string;
    }

    /*
     * js实现php函数urlencode
     */
    static async urlencode (clearString) {
        var output = '';
        var x = 0;
        clearString = clearString.toString();
        var regex = /(^[a-zA-Z0-9-_.]*)/;
        while (x < clearString.length) {
            var match = regex.exec(clearString.substr(x));
            if (match != null && match.length > 1 && match[1] != '') {
                output += match[1];
                x += match[1].length;
            }
            else {
                if (clearString.substr(x, 1) == ' ') {
                    //原文在此用 clearString[x] == ' ' 做判断, 但ie不支持把字符串当作数组来访问,
                    //修改后两种浏览器都可兼容
                    output += '+';
                }
                else {
                    var charCode = clearString.charCodeAt(x);
                    var hexVal = charCode.toString(16);
                    output += '%' + ( hexVal.length < 2 ? '0' : '' ) + hexVal.toUpperCase();
                }
                x++;
            }
        }
        return output;
    }
}

export default MiniService