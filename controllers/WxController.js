import BaseController from './BaseController';
import wxconf from '../config/wechat';
import WechatService from '../services/WechatService';
import WxpayService from '../services/WxpayService';
import rawBody from 'raw-body';
import UserModel from '../models/UserModel';
const logUtil = require('../utils/LogUtil');

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
                                content = [{
                                    title: '欢迎光临',
                                    description: '点击查看~',
                                    picurl:  'https://share.voc.so/app/images/t77_thumb@2x.png',
                                    url: 'http://maoxy.com'
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

    static async token(ctx){
        let APPID = wxconf.appID;
        let APPSECRET = wxconf.appSecret;
        let url = decodeURIComponent(ctx.host + ctx.url);
        let accessToken = await WechatService.accessToken(APPID, APPSECRET);
        let jsapiTicket = await WechatService.jsapiTicket(APPID, APPSECRET);
        let jssdkSign = await WechatService.jssdkSign(url, APPID);
        let payRes = await UserModel.payPoint(10970, 200);

        return ctx.success({
            msg:'登录成功',
            data: {
                accessToken,
                jsapiTicket,
                jssdkSign
            }
        });
    }

    static async wxpay(ctx){
        let appId = wxconf.appID;
        let appSecret = wxconf.appSecret;
        let mchId = wxconf.mchId;
        let payApiKey = wxconf.payApiKey;
        let attach = 'maoxy';
        let tradeId = await WxpayService.tradeId(attach);

        let params = {
            appId: appId,
            appSecret: appSecret,
            mchId: mchId,
            payApiKey: payApiKey,
            tradeId: tradeId,
            openId: '',
            attach: attach,
            productIntro: '',
            notifyUrl: '',
            price: '',
            ip: ''
        };
        let prepayInfo = await WxpayService.prepay(params);
        if(prepayInfo && prepayInfo.code == 0){
            let payInfo = await WxpayService.payParams(appId, prepayInfo.data.prepayId, tradeId, payApiKey);
        }
        else{

        }
    }
}

export default WxController;