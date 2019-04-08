/**
 * Created by Administrator on 2019/2/20.
 */

import crypto from 'crypto';
import xml2js from 'xml2js';
import sha1 from 'sha1';
import request from 'superagent';
import redis from '../utils/redis';
import CryptoJS from 'crypto-js';
import fs from 'fs';
import Common from '../utils/common';

const _ = require("lodash");
const logUtil = require('../utils/LogUtil');
const download = require('download');

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

    static async reply (messageObj) {
        //回复消息模板
        var { ToUserName, FromUserName, MsgType = 'text'} = messageObj;
        var CreateTime = new Date().getTime();
        var header = `<xml>
                    <ToUserName><![CDATA[${ToUserName}]]></ToUserName>
                    <FromUserName><![CDATA[${FromUserName}]]></FromUserName>
                    <CreateTime>${CreateTime}</CreateTime>
                    <MsgType><![CDATA[${MsgType}]]></MsgType>`;
        var content = '';
        switch(MsgType) {
            case 'text':
                var { Content } = messageObj;
                content = `<Content><![CDATA[${Content}]]></Content>
                     </xml>`;
                break;
            case 'image':
                var { MediaId }  = messageObj;
                content = `<Image>
                         <MediaId><![CDATA[${MediaId}]]></MediaId>
                       </Image>
                     </xml>`;
                break;
            case 'voice':
                var { MediaId } = messageObj;
                content = `<Voice>
                         <MediaId><![CDATA[${MediaId}]]></MediaId>
                       </Voice>
                     </xml>`;
                break;
            case 'video':
                var { MediaId, Title, Description } = messageObj;
                content = `<Video>
                         <MediaId><![CDATA[${MediaId}]]></MediaId>
                         <Title><![CDATA[${Title}]]></Title>
                         <Description><![CDATA[${Description}]]></Description>
                       </Video> 
                     </xml>`;
                break;
            case 'music':
                var { Title, Description, MusicUrl, HQMusicUrl, ThumbMediaId } = messageObj;
                content = `<Music>
                         <Title><![CDATA[${Title}]]></Title>
                         <Description><![CDATA[${Description}]]></Description>
                         <MusicUrl><![CDATA[${MusicUrl}]]></MusicUrl>
                         <HQMusicUrl><![CDATA[${HQMusicUrl}]]></HQMusicUrl>
                         <ThumbMediaId><![CDATA[${ThumbMediaId}]]></ThumbMediaId>
                       </Music>
                     </xml>`;
                break;
            case 'news':
                var { Articles } = messageObj;
                var ArticleCount = Articles.length;
                content = `<ArticleCount>${ArticleCount}</ArticleCount><Articles>`;
                for (var i = 0; i < ArticleCount; i++) {
                    content += `<item>
                                <Title><![CDATA[${Articles[i].Title}]]></Title>
                                <Description><![CDATA[${Articles[i].Description}]]></Description>
                                <PicUrl><![CDATA[${Articles[i].PicUrl}]]></PicUrl>
                                <Url><![CDATA[${Articles[i].Url}]]></Url>
                              </item>`;
                }
                content += '</Articles></xml>';
                break;
            default:
                content = `<Content><![CDATA[Error]]></Content>
                     </xml>`;
        }

        var xml = header + content;
        return xml;
    }

    /*
     * 消息转发到客服
     */
    static async transfer_customer_service(fromUsername, toUsername){
        let msgType = 'transfer_customer_service';
        let createTime = new Date().getTime();

        let xml = `
             <xml>
                 <ToUserName><![CDATA[${toUsername}]]></ToUserName>
                 <FromUserName><![CDATA[${fromUsername}]]></FromUserName>
                 <CreateTime>${createTime}</CreateTime>
                 <MsgType><![CDATA[${msgType}]]></MsgType>          
            </xml>
        `;
        return xml;
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
            let rtn = JSON.parse(rtnData.text);
            if(rtn.access_token && rtn.openid){
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
            if(rtn.openid){
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
        let url;
        if(timelong == 'forever') {
            //永久素材
            url = 'https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=' + access_token + '&type=' + type;
        }
        else{
            //临时素材
            url = 'https://api.weixin.qq.com/cgi-bin/media/upload?access_token=' + access_token + '&type=' + type;
        }

        let filename = Common.md5(media_path);
        let filepath = './static/service/' + filename + '.png';
        if (!fs.existsSync(filepath)) {
            await download(media_path).pipe(fs.createWriteStream(filepath));
        }

        let rtnData = await request.post(url)
            .set('Content-Type', 'application/json')
            .attach('media', fs.createReadStream(filepath));

        let res = null;
        if (rtnData.status == 200 && rtnData.text) {
            let rtn = JSON.parse(rtnData.text);
            console.log(rtn);
            if(rtn.errcode && rtn.errcode != 0){

            }
            else{
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
            console.log('444444444444')
            console.log(params)
            obj.image = {
                media_id: params.mediaId
            }
        }
        else if(params.msgtype == 'video'){
            obj.video = {
                media_id: params.mediaId
            }
        }
        else if(params.msgtype == 'voice'){
            obj.voice = {
                media_id: params.mediaId
            }
        }

        let rtnData = await request.post(url)
            .set('Content-Type', 'application/json')
            .send(obj);

        let res = null;
        if (rtnData.status == 200 && rtnData.text) {
            let rtn = JSON.parse(rtnData.text);
            console.log('55555555555')
            console.log(rtn)
            if(rtn.errcode && rtn.errcode != 0){

            }
            else{
                res = rtn;
            }
        }

        return res;
    }

    static async sendTemplateMessage(access_token, body){
        let url = 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + access_token;
        let rtnData = await request.post(url)
            .set('Content-Type', 'application/json')
            .send(body);

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

    static async userInfoByOpenid(access_token, openid){
        let url = "https://api.weixin.qq.com/cgi-bin/user/info";
        let rtnData = await request.get(url)
            .query({lang: 'zh_CN'})
            .query({openid: openid})
            .query({access_token: access_token});

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