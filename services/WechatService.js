/**
 * Created by Administrator on 2019/2/20.
 */

import crypto from 'crypto';
import xml2js from 'xml2js';
import sha1 from 'sha1';
import request from 'superagent';
import redis from '../utils/redis';
import CryptoJS from 'crypto-js';

const _ = require("lodash");
const logUtil = require('../utils/LogUtil');
const ejs = require('ejs')

class WechatService {
    static async checkSignature(signature, timestamp, nonce, token) {
        let hash = crypto.createHash('sha1');
        const arr = [token, timestamp, nonce].sort();
        hash.update(arr.join(''));
        return hash.digest('hex') === signature;
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

    /*
     * {xml: {a: 111, b: 222}}
     */
    static async parseJson2XML(obj){
        const builder = new xml2js.Builder()
        return builder.buildObject(obj);
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

    /*
     * 消息转发到客服
     */
    static async transfer_customer_service(fromUsername, toUsername){
        let tpl = `
             <xml>
                 <ToUserName><![CDATA[<%-toUsername%>]]></ToUserName>
                 <FromUserName><![CDATA[<%-fromUsername%>]]></FromUserName>
                 <CreateTime><%=createTime%></CreateTime>
                 <MsgType><![CDATA[<%=msgType%>]]></MsgType>          
            </xml>
        `;
        const compiled = ejs.compile(tpl);
        let info = {};
        info.msgType = 'transfer_customer_service';
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

    static async jssdk(url, appId, appSecret) {
        // await ……
        let noncestr = Math.random().toString(36).substr(2, 15);
        let timestamp = parseInt(new Date().getTime() / 1000) + '';
        let jsapi_ticket = await WechatService.jsapiTicket(appId, appSecret);

        let params = {
            jsapi_ticket: jsapi_ticket,
            nonceStr: noncestr,
            timestamp: timestamp,
            url: url
        };
        let string = await WechatService.raw(params);
        let signature = sha1(string);
        let rtn = {
            signature: signature,
            appId: appId,
            timeStamp: timestamp,
            nonceStr: noncestr
        };

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
            console.log('555555555');
            console.log(rtnData);
            let rtn = JSON.parse(rtnData.text);
            if(rtn.errcode == 0){
                logUtil.logDebug('authToken==>' + rtnData.text);
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

    static async qrcode(access_token, type, scene_str) {
        let url = "https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=" + access_token;
        let params;
        let qrcode_img_url = null;
        if(type == 'limit') {
            //临时二维码
            params = {
                expire_seconds: 2592000,
                action_name: "QR_STR_SCENE",
                action_info:{
                    scene: {
                        scene_str: scene_str
                    }
                }
            };
        }
        else{
            params = {
                action_name: "QR_LIMIT_STR_SCENE",
                action_info:{
                    scene: {
                        scene_str: scene_str
                    }
                }
            };
        }

        let rtnData = await request.post(url)
            .set('Content-Type', 'application/json')
            .send(params);

        if (rtnData.status == 200 && rtnData.text) {
            let rtn = JSON.parse(rtnData.text);
            if(rtn.errcode && rtn.errcode != 0){

            }
            else{
                let encode_ticket = await WechatService.urlencode(rtn.ticket);
                qrcode_img_url = "https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=" + encode_ticket;
            }
        }

        return qrcode_img_url;
    }

    static async menu(access_token, menu_body){
        let url = 'https://api.weixin.qq.com/cgi-bin/menu/create?access_token=' + access_token;
        let rtnData = await request.post(url)
            .set('Content-Type', 'application/json')
            .send(menu_body);

        let res = null;
        if (rtnData.status == 200 && rtnData.text) {
            let rtn = JSON.parse(rtnData.text);
            if(rtn.errcode && rtn.errcode != 0){

            }
            else{
                res = rtn;
            }
        }

        return res;
    }

    static async addressParameters(prams){
        let noncestr = Math.random().toString(36).substr(2, 15);
        let timestamp = parseInt(new Date().getTime() / 1000) + '';
        let args = {
            appid: prams.appid,
            url: prams.url,
            timestamp: timestamp,
            noncestr: noncestr,
            accesstoken: prams.access_token
        };

        let stringA = await WechatService.raw(args);
        let signature = sha1(stringA);
        let rtn = {
            addrSign: signature,
            signType: 'sha1',
            scope: 'jsapi_address',
            appId: args.appid,
            timeStamp: args.timestamp,
            nonceStr: args.noncestr
        };

        return rtn;
    }

    static  async uploadMediaFile(access_token, media_path, timelong, type='image'){
        console.log('ddddddddddd');
        let url;
        if(timelong == 'forever') {
            //永久素材
            url = 'https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=' + access_token + '&type=' + type;
        }
        else{
            //临时素材
            url = 'https://api.weixin.qq.com/cgi-bin/media/upload?access_token=' + access_token + '&type=' + type;
        }

        console.log(url);
        let rtnData = await request.post(url)
            .set('Content-Type', 'application/json')
            .attach('media', media_path);

        let res = null;
        console.log('77777777777777');
        console.log(rtnData);
        if (rtnData.status == 200 && rtnData.text) {
            let rtn = JSON.parse(rtnData.text);
            if(rtn.errcode && rtn.errcode != 0){
                console.log('888888888888888');
            }
            else{
                console.log('CCCCCCCCCCCCCCCC');
                res = rtn;
            }
        }

        return res;
    }

    static async sendCustomMessage(access_token, params){
        let url = 'https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=' + access_token;
        let obj = {};
        obj.touser = params.touser;
        obj.msgtype = params.msgtype;
        if(params.msgtype == 'text'){
            obj.text = {
                content: params.content
            }
        }
        else if(params.msgtype == 'image'){
            obj.image = {
                media_id: params.media_id
            }
        }
        else if(params.msgtype == 'video'){
            obj.video = {
                media_id: params.media_id
            }
        }
        else if(params.msgtype == 'voice'){
            obj.voice = {
                media_id: params.media_id
            }
        }

        let rtnData = await request.post(url)
            .set('Content-Type', 'application/json')
            .send(obj);

        let res = null;
        if (rtnData.status == 200 && rtnData.text) {
            let rtn = JSON.parse(rtnData.text);
            if(rtn.errcode && rtn.errcode != 0){

            }
            else{
                res = rtn;
            }
        }

        return res;
    }
}

export default WechatService