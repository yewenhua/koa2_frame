/**
 * Created by Administrator on 2019/2/20.
 */

import crypto from 'crypto';
import xml2js from 'xml2js';
import sha1 from 'sha1';
import request from 'superagent';
import redis from '../utils/redis';
import CryptoJS from 'crypto-js';
import logUtil from '../utils/logUtil';

const _ = require("lodash");

class WechatService {
    static async checkSignature(timestamp, nonce, token) {
        let hash = crypto.createHash('sha1');
        const arr = [token, timestamp, nonce].sort();
        hash.update(arr.join(''));
        return hash.digest('hex');
    }

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

    static async reply (content, fromUsername, toUsername) {
        //回复消息模板
        let tpl = `
             <xml>
                 <ToUserName><![CDATA[<%-toUsername%>]]></ToUserName>
                 <FromUserName><![CDATA[<%-fromUsername%>]]></FromUserName>
                 <CreateTime><%=createTime%></CreateTime>
                 <MsgType><![CDATA[<%=msgType%>]]></MsgType>
                 <% if (msgType === 'news') { %>
                 <ArticleCount><%=content.length%></ArticleCount>
                 <Articles>
                 <% content.forEach(function(item){ %>
                 <item>
                 <Title><![CDATA[<%-item.title%>]]></Title>
                 <Description><![CDATA[<%-item.description%>]]></Description>
                 <PicUrl><![CDATA[<%-item.picUrl || item.picurl || item.pic || item.thumb_url %>]]></PicUrl>
                 <Url><![CDATA[<%-item.url%>]]></Url>
                 </item>
                 <% }); %>
                 </Articles>
                 <% } else if (msgType === 'music') { %>
                 <Music>
                 <Title><![CDATA[<%-content.title%>]]></Title>
                 <Description><![CDATA[<%-content.description%>]]></Description>
                 <MusicUrl><![CDATA[<%-content.musicUrl || content.url %>]]></MusicUrl>
                 <HQMusicUrl><![CDATA[<%-content.hqMusicUrl || content.hqUrl %>]]></HQMusicUrl>
                 </Music>
                 <% } else if (msgType === 'voice') { %>
                 <Voice>
                 <MediaId><![CDATA[<%-content.mediaId%>]]></MediaId>
                 </Voice>
                 <% } else if (msgType === 'image') { %>
                 <Image>
                 <MediaId><![CDATA[<%-content.mediaId%>]]></MediaId>
                 </Image>
                 <% } else if (msgType === 'video') { %>
                 <Video>
                 <MediaId><![CDATA[<%-content.mediaId%>]]></MediaId>
                 <Title><![CDATA[<%-content.title%>]]></Title>
                 <Description><![CDATA[<%-content.description%>]]></Description>
                 </Video>
                 <% } else { %>
                 <Content><![CDATA[<%-content%>]]></Content>
                 <% }                           
            </xml>
        `;
        const compiled = ejs.compile(tpl);

        let info = {};
        let type = 'text';
        info.content = content || '默认消息';
        // 判断消息类型
        if (Array.isArray(content)) {
            type = 'news';
        }
        else if (typeof content === 'object') {
            if (content.hasOwnProperty('type')) {
                type = content.type;
                info.content = content.content;
            }
            else {
                type = 'music';
            }
        }
        info.msgType = type;
        info.createTime = new Date().getTime();
        info.toUsername = toUsername;
        info.fromUsername = fromUsername;
        return compiled(info);
    }

    static async accessToken(apppId, appSecret) {
        // await ……
        let str = 'accesstoken' + apppId;
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
                logUtil.logDebug('ACCESSTOKEN==>' + rtn.access_token);
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

    static async jsapiTicket(apppId, appSecret) {
        // await ……
        let str = 'jsapiticket' + apppId;
        let key = CryptoJS.SHA1(str).toString();
        let cacheValue = await redis.get(key);
        let now = (new Date()).getTime()/1000;
        if(!cacheValue || (JSON.parse(cacheValue)).expire_time < now) {
            let TOKEN = await WechatService.accessToken(apppId, appSecret);
            if(TOKEN) {
                let url = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket';
                let rtnData = await request.get(url)
                    .query({type: 'jsapi'})
                    .query({access_token: TOKEN});

                if (rtnData.status == 200 && rtnData.text) {
                    let rtn = JSON.parse(rtnData.text);
                    if(rtn.errcode == 0){
                        logUtil.logDebug('TICKET==>' + rtn.ticket);
                        let cache = {
                            expire_time: (new Date()).getTime() / 1000 + 6000,
                            jsapiticket: rtn.ticket
                        };
                        redis.set(key, JSON.stringify(cache), 6000);
                        return rtn.ticket;
                    }
                    else{
                        return null;
                    }
                }
                else {
                    return null;
                }
            }
            else{
                return null;
            }
        }
        else{
            let cache = JSON.parse(cacheValue);
            return cache.jsapiticket;
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

    static async jssdkSign(url, apppId) {
        // await ……
        let noncestr = Math.random().toString(36).substr(2, 15);
        let timestamp = parseInt(new Date().getTime() / 1000) + '';
        let jsapi_ticket = await WechatService.jsapiTicket();

        let rtn = {
            jsapi_ticket: jsapi_ticket,
            nonceStr: noncestr,
            timestamp: timestamp,
            url: url
        };
        let string = await WechatService.raw(rtn);
        let signature = sha1(string);
        rtn.signature = signature;
        rtn.appId = apppId;

        return rtn;
    }

    static async oauthBase(appId, redirect_uri, state) {
        return await WechatService.oauth_url(appId, redirect_uri, state, 'snsapi_base');
    }

    static async oauthUserinfo(appId, redirect_uri, state) {
        return await WechatService.oauth_url(appId, redirect_uri, state, 'snsapi_userinfo');
    }

    static async oauth_url(appId, redirect_uri, state, scope){
        let encode_redirect_uri = await WechatService.urlencode(redirect_uri);
        let params = {
            appid: appId,
            redirect_uri: encode_redirect_uri,
            response_type: 'code',
            scope: scope,
            state: state
        }

        let urlparams = await WechatService.raw(params);
        let url = "https://open.weixin.qq.com/connect/oauth2/authorize?" + urlparams + "#wechat_redirect";
        return url;
    }

    static async authInfoByCode(code, appId, appSecret){
        let url = "https://api.weixin.qq.com/sns/oauth2/access_token";
        let rtnData = await request.get(url)
            .query({grant_type: 'authorization_code'})
            .query({appid: appId})
            .query({secret: appSecret})
            .query({code: code});

        if (rtnData.status == 200 && rtnData.text) {
            let rtn = JSON.parse(rtnData.text);
            if(rtn.errcode == 0){
                logUtil.logDebug('authInfo==>' + rtnData.text);
                return rtn;
            }
            else{
                return null;
            }
        }
        else {
            return null;
        }
    }

    static async userInfoByOauth(openid, accessToken){
        let url = "https://api.weixin.qq.com/sns/userinfo";
        let rtnData = await request.get(url)
            .query({lang: 'zh_CN'})
            .query({openid: openid})
            .query({access_token: accessToken});

        if (rtnData.status == 200 && rtnData.text) {
            let rtn = JSON.parse(rtnData.text);
            if(rtn.errcode == 0){
                logUtil.logDebug('userInfo==>' + rtnData.text);
                return rtn;
            }
            else{
                return null;
            }
        }
        else {
            return null;
        }
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

export default WechatService