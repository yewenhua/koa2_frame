import BaseController from './BaseController';
import wxconf from '../config/wechat';
import WechatService from '../services/WechatService';
import WxpayService from '../services/WxpayService';
import rawBody from 'raw-body';
import UserModel from '../models/UserModel';
import ImageModel from '../models/ImageModel';
import Common from '../utils/common';
import redis from '../utils/redis';
const logUtil = require('../utils/LogUtil');

class WxController extends BaseController{
    static async check(ctx) {
        const { signature, timestamp, nonce, echostr } = ctx.query;
        const TOKEN = wxconf.token;
        if (signature === Wechat.checkSignature(timestamp, nonce, TOKEN)) {
            return ctx.body = echostr;
        }
        else{
            ctx.status = 401;
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


        return ctx.success({
            msg:'登录成功',
            data: {
                accessToken,
                jsapiTicket,
                jssdkSign
            }
        });
    }

    static async outhurl(ctx){
        ctx.body = ctx.request.body;
        let { type, state, redirect_uri } = ctx.body;
        let appId = wxconf.appID;
        let url;
        if(type == 'base'){
            url = await WechatService.oauthBase(appId, redirect_uri, state);
        }
        else{
            url = await WechatService.oauthUserinfo(appId, redirect_uri, state);
        }

        return ctx.success({
            msg:'操作成功',
            data: {
                url
            }
        });
    }

    static async outhinfo(ctx){
        ctx.body = ctx.request.body;
        let { code, type } = ctx.body;
        let appId = wxconf.appID;
        let appSecret = wxconf.appSecret;
        let secret = process.env.SECRET;
        let tokenInfo = await WechatService.authInfoByCode(code, appId, appSecret);
        let rtn = {};
        if(tokenInfo && !tokenInfo.errcode) {
            let key = Common.md5(tokenInfo.openid + secret);
            redis.set(key, tokenInfo.openid, 2 * 3600);
            rtn.openkey = key;
            if (type != 'base') {
                let info = await WechatService.userInfoByOauth(tokenInfo.openid, tokenInfo.access_token);
                if(info && !info.errcode) {
                    rtn.nickname = nickname;
                    rtn.sex = sex;
                    rtn.province = province;
                    rtn.city = city;
                    rtn.country = country;
                    rtn.headimgurl = headimgurl;
                }
            }

            return ctx.success({
                msg:'操作成功',
                data: rtn
            });
        }
        else{
            return ctx.error({
                code: 10001,
                msg: '操作失败',
                data: null
            });
        }
    }

    /*
     * jsapi支付
     */
    static async wxpay(ctx){
        ctx.body = ctx.request.body;
        let { openkey, price } = ctx.body;
        let openid = await redis.get(openkey);
        let ip = ctx.request.ip;
        let appId = wxconf.appID;
        let mchId = wxconf.mchId;
        let payApiKey = wxconf.payApiKey;
        let attach = 'jsapi_maoxy';
        let tradeId = await WxpayService.tradeId(attach);
        let notify_url = process.env.DOMAIN + '/ai/wechat/notify';
        let fee = price * 100;

        let params = {
            appId: appId,
            mchId: mchId,
            payApiKey: payApiKey,
            tradeId: tradeId,
            openId: openid,
            attach: attach,
            body: 'jsapi pay goods',
            notifyUrl: notify_url,
            type: 'JSAPI',
            price: fee,
            ip: ip
        };
        let prepayInfo = await WxpayService.prepay(params);
        if(prepayInfo && prepayInfo.data.prepay_id){
            let payInfo = await WxpayService.payParams(appId, prepayInfo.data.prepayId, tradeId, payApiKey);
            //传到前端进行支付
        }
        else{

        }
    }

    /*
     * jsapi支付结果通知
     */
    static async notify(ctx){
        let ret = {};
        let payApiKey = wxconf.payApiKey;
        let xml = await rawBody(ctx.req, {
            length: ctx.request.length,
            limit: '1mb',
            encoding: ctx.request.charset || 'utf-8'
        });
        let cbJsonData = await WechatService.parseXML2Json(xml);
        let check = await WechatService.notify(cbJsonData, payApiKey);
        if(check){
            let total_fee = cbJsonData.total_fee;
            let out_trade_no = cbJsonData.out_trade_no;
            ret.return_code = 'SUCCESS';
            ret.return_msg = 'OK';
        }
        else{
            ret.return_code = 'FAIL';
            ret.return_msg = 'ERROR';
        }


        let replayXml = await WxpayService.parseJson2XML(ret);
        ctx.body = replayXml;
    }

    /*
     * 生成扫码支付二维码
     */
    static async scanpayurl(ctx){
        let appId = wxconf.appID;
        let payApiKey = wxconf.payApiKey;
        let mchId = wxconf.mchId;
        let product_id = '514176213';
        let params = {
            appId,
            payApiKey,
            mchId,
            product_id
        };

        let url = await WxpayService.createPayQrcodeUrl(params);
        let qrcode_url = await WxpayService.generateQrcode(url);
        return qrcode_url;
    }

    /*
     * 扫码支付回调
     */
    static async scanpaycb(ctx){
        let payApiKey = wxconf.payApiKey;
        let xml = await rawBody(ctx.req, {
            length: ctx.request.length,
            limit: '1mb',
            encoding: ctx.request.charset || 'utf-8'
        });

        let cbJsonData = await WechatService.parseXML2Json(xml);
        let ip = ctx.request.ip;;
        let notify_url = process.env.DOMAIN + '/ai/wechat/notify';
        let price = 1;
        let params = {
            payApiKey: payApiKey,
            notify_url: notify_url,
            price: price,
            ip: ip
        };

        let replayXml = await WechatService.scanPayCb(cbJsonData, params);
        ctx.body = replayXml;
    }
}

export default WxController;