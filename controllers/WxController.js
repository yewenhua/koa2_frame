import BaseController from './BaseController';
import sha1 from 'sha1';
import wxconf from '../config/wechat';
import WechatService from '../services/WechatService';
import rawBody from 'raw-body';

const logUtil = require('../utils/logUtil');

class WxController extends BaseController{
    static async check(ctx) {
        const { signature, timestamp, nonce, echostr } = ctx.query;
        const TOKEN = wxconf.token;
        if (signature === Wechat.checkSignature(timestamp, nonce, TOKEN)) {
            return ctx.body = echostr;
        }
        else{
            ctx.status = 401
            ctx.body = 'Invalid signature';
        }
    }

    static async run(ctx) {
        const { signature, timestamp, nonce, echostr } = ctx.query;
        const TOKEN = wxconf.token;
        if (signature !== WechatService.checkSignature(timestamp, nonce, TOKEN)) {
            ctx.status = 401;
            ctx.body = 'Invalid signature';
        }
        else{
            let content;
            let replyMessageXml;
            const xml = await rawBody(ctx.req, {
                length: ctx.request.length,
                limit: '1mb',
                encoding: ctx.request.charset || 'utf-8'
            });
            const jsonData = await WechatService.parseXML2Json(xml);
            switch (jsonData.MsgType){
                case 'event':
                    let eventName = (jsonData.Event).toLowerCase();
                    if(eventName == 'subscribe'){
                        //关注事件
                    }
                    else if(eventName == 'unsubscribe'){
                        //取消关注事件
                        content = '你好，欢迎光临';
                    }
                    else if(eventName == 'scan'){
                        //用户已关注时的扫码事件推送
                    }
                    else if(eventName == 'location'){
                        //上报地理位置事件，每次进入公众号会话时
                    }
                    else if(eventName == 'view'){
                        //点击菜单跳转链接时的事件推送
                    }
                    else if(eventName == 'click'){
                        //点击菜单拉取消息时的事件推送
                        let eventKey = (jsonData.EventKey).toLowerCase();
                        switch (eventKey) {
                            case 'V1001_FIRST':
                                //单图文消息
                                let url = 'http://maoxy.com';
                                content = [{
                                    title: '欢迎光临',
                                    description: '点击查看~',
                                    picurl:  'https://share.voc.so/app/images/t77_thumb@2x.png',
                                    url: url
                                }];
                                break;
                            case 'V1002_SECOND':
                                //多图文消息
                                let url = 'http://maoxy.com';
                                content = [
                                    {
                                        title: '欢迎光临1',
                                        description: '点击查看~',
                                        picurl:  'https://share.voc.so/app/images/t77_thumb@2x.png',
                                        url: url
                                    },
                                    {
                                        title: '欢迎光临2',
                                        description: '点击查看~',
                                        picurl:  'https://share.voc.so/app/images/t77_thumb@2x.png',
                                        url: url
                                    }
                                ];
                                break;
                            case 'V2001_FIRST':
                                //文本消息
                                content = '你好';
                                break;
                            case 'V2002_SECOND':
                                //图片消息
                                break;
                            case 'V3001_FIRST':
                                //music
                                content = {
                                    type: 'music',
                                    content: {
                                        title: 'Lemon Tree',
                                        description: 'Lemon Tree',
                                        musicUrl: 'http://mp3.com/xx.mp3'
                                    },
                                }
                                break;
                            case 'V3002_SECOND':
                                break;
                            default:
                                break;
                        }
                    }
                    else if(eventName == 'templatesendjobfinish'){
                        //模版消息发送任务完成
                    }
                    break;
                case 'transfer_customer_service':
                    break;
                case 'image':
                    content = {
                        type: 'image',
                        content: {
                            mediaId: jsonData.MediaId
                        }
                    }
                    break;
                case 'link':
                    break;
                case 'voice':
                    content = {
                        type: 'voice',
                        content: {
                            mediaId: jsonData.MediaId
                        }
                    }
                    break;
                case 'video':
                    break;
                case 'text':
                    content = jsonData.Content;
                    break;
                case 'location':
                    break;
                default:
                    break;
            }

            replyMessageXml = WechatService.reply(content, jsonData.ToUserName, jsonData.FromUserName);
            ctx.type = 'application/xml';
            ctx.body = replyMessageXml;
        }
    }

    static async getToken(ctx) {
        // await ……
        let APPID = 'wxdbe18f838fcee2ba';
        let APPSECRET = 'c4ed6f5686ede08670db66769dfc63b4'

        let options = {
            method: 'GET',
            hostname: 'api.weixin.qq.com',
            port: 80,
            path: '/cgi-bin/token?grant_type=client_credential&appid='+APPID+'&secret='+APPSECRET
        };

        let url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + APPID + '&secret=' + APPSECRET;

    }

    static async getJsapiTicket(token) {
        // await ……
        let url = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+token+'&type=jsapi';
    }

    static async sign(ctx) {
        // await ……
        const noncestr='Wm3WZYTPz0wzccnW12';
        const url = decodeURIComponent(ctx.url);
        const timestamp = Date.parse(new Date)/1000;
        let jsticket = '';

        let data = {
            noncestr: noncestr,
            timestamp: timestamp,
            url: url,
            jsapi_ticket:list[0].jsticket,
            signature:sha1('jsapi_ticket=' + jsticket + '&noncestr=' + noncestr + '&timestamp=' + timestamp + '&url=' + url)
        }

    }
}

export default WxController;