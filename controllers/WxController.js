import BaseController from './BaseController';
import wxconf from '../config/wechat';
import WechatService from '../services/WechatService';
import WxpayService from '../services/WxpayService';
import rawBody from 'raw-body';
import UserModel from '../models/UserModel';
import ImageModel from '../models/ImageModel';
import CustomServiceModel from '../models/CustomServiceModel';
import Common from '../utils/common';
import redis from '../utils/redis';
const logUtil = require('../utils/LogUtil');

class WxController extends BaseController{
    /*
     * GET
     * 验证消息的确来自微信服务器
     */
    static async check(ctx) {
        const { signature, timestamp, nonce, echostr } = ctx.query;
        const TOKEN = wxconf.token;
        if (WechatService.checkSignature(signature, timestamp, nonce, TOKEN)) {
            return ctx.body = echostr;
        }
        else{
            ctx.status = 401;
            ctx.body = 'Invalid signature';
        }
    }

    /*
     * POST
     * 依据接口实现业务逻辑
     */
    static async run(ctx) {
        const { signature, timestamp, nonce } = ctx.query;
        const TOKEN = wxconf.token;
        //const APPID = wxconf.appID;
        //const APPSECRET = wxconf.appSecret;
        const APPID = 'wx184c063cea04b3d4';
        const APPSECRET = '4fd028f45d13e4a6a8cc40dcd07010de';
        if (!WechatService.checkSignature(signature, timestamp, nonce, TOKEN)) {
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
            console.log(jsonData)
            switch (jsonData.MsgType){
                case 'event':
                    let eventName = (jsonData.Event).toLowerCase();
                    let eventKey = (jsonData.EventKey).toLowerCase();
                    if(eventName == 'subscribe'){
                        //关注事件
                        if(eventKey.indexOf('qrscene_') !== false){
                            //带参数二维码，绑定专属客服
                            let param_str = eventKey.substring(8);
                            await WxController.serviceqrcode(jsonData, param_str);
                        }
                    }
                    else if(eventName == 'unsubscribe'){
                        //取消关注事件
                    }
                    else if(eventName == 'scan'){
                        //用户已关注时的扫码事件推送
                        if(eventKey.indexOf('bind') !== false && jsonData.Ticket){
                            //带参数二维码，绑定专属客服
                            let param_str = eventKey;
                            await WxController.serviceqrcode(jsonData, param_str);
                        }
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
                                replyMessageXml = await WechatService.reply(content, jsonData.ToUserName, jsonData.FromUserName);
                                ctx.type = 'application/xml';
                                ctx.body = replyMessageXml;
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
                                replyMessageXml = await WechatService.reply(content, jsonData.ToUserName, jsonData.FromUserName);
                                ctx.type = 'application/xml';
                                ctx.body = replyMessageXml;
                                break;
                            case 'V2001_FIRST':
                                //文本消息
                                content = '你好';
                                replyMessageXml = await WechatService.reply(content, jsonData.ToUserName, jsonData.FromUserName);
                                ctx.type = 'application/xml';
                                ctx.body = replyMessageXml;
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
                                replyMessageXml = await WechatService.reply(content, jsonData.ToUserName, jsonData.FromUserName);
                                ctx.type = 'application/xml';
                                ctx.body = replyMessageXml;
                                break;
                            case 'V3002_SECOND':
                                break;
                            case 'V3003_SERVICE':
                                //用户点击专属客服按钮
                                replyMessageXml = await WxController.servicebtn(jsonData, APPID, APPSECRET);
                                ctx.type = 'application/xml';
                                ctx.body = replyMessageXml;
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
                    replyMessageXml = await WxController.servicetrans(jsonData, APPID, APPSECRET);
                    ctx.type = 'application/xml';
                    ctx.body = replyMessageXml;
                    break;
                case 'link':
                    break;
                case 'voice':
                    replyMessageXml = await WxController.servicetrans(jsonData, APPID, APPSECRET);
                    ctx.type = 'application/xml';
                    ctx.body = replyMessageXml;
                    break;
                case 'video':
                    replyMessageXml = await WxController.servicetrans(jsonData, APPID, APPSECRET);
                    ctx.type = 'application/xml';
                    ctx.body = replyMessageXml;
                    break;
                case 'text':
                    content = jsonData.Content;
                    if(content == '专属客服绑定' || content == '专属客服解绑'){
                        //生成专属客服二维码（带参数）参数 openid的16位MD5值
                        await WxController.servicebind(jsonData, APPID, APPSECRET);
                    }
                    else{
                        replyMessageXml = await WxController.servicetrans(jsonData, APPID, APPSECRET);
                        ctx.type = 'application/xml';
                        ctx.body = replyMessageXml;
                    }
                    break;
                case 'location':
                    break;
                default:
                    break;
            }
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
        let attach = 'jsapi';
        let tradeId = await WxpayService.tradeId(attach);
        let notify_url = process.env.DOMAIN + '/wechat/notify';
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
        if(prepayInfo && prepayInfo.prepay_id){
            let payInfo = await WxpayService.payParams(appId, prepayInfo.data.prepayId, tradeId, payApiKey);
            //传到前端进行支付
        }
        else{

        }
    }

    /*
     * 支付结果通知
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
        let check = await WxpayService.notify(cbJsonData, payApiKey);
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

        return ctx.success({
            msg:'操作成功',
            data: {
                qrcode_url: qrcode_url
            }
        });
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
        let ip = '120.25.205.187';
        let notify_url = process.env.DOMAIN + '/wechat/notify';
        let price = 1;
        let params = {
            payApiKey: payApiKey,
            notify_url: notify_url,
            price: price,
            ip: ip,
            body: '扫码支付'
        };

        let replayXml = await WxpayService.scanPayCb(cbJsonData, params);
        ctx.body = replayXml;
    }

    static async servicetrans(wxData, APPID, APPSECRET){
        console.log('3333333333')
        //判断当前用户身份
        let serviceInfo = await CustomServiceModel.findByCustomOpenid(wxData.FromUserName);
        let customInfo = await CustomServiceModel.findByServiceOpenid(wxData.FromUserName);
        if(serviceInfo && serviceInfo.service_openid && serviceInfo.status == 'bind'){
            //当前身份是用户，已绑定专属客服，收到的是自己发送的消息,转到专属客服
            let params = {
                touser: serviceInfo.service_openid,
                msgtype: wxData.MsgType
            };

            if(wxData.MsgType == 'text'){
                params.content = jsonData.Content;
            }
            else if(wxData.MsgType == 'video' || wxData.MsgType == 'voice' || wxData.MsgType == 'image'){
                params.mediaId = wxData.MediaId;
            }
            else{

            }
            let access_token = await WechatService.accessToken(APPID, APPSECRET);
            await WechatService.sendCustomMessage(access_token, params);
        }
        else if(customInfo && customInfo.custom_openid && customInfo.status == 'bind'){
            //当前身份是客服，收到的是自己发送的消息，转到客户
            let params = {
                touser: customInfo.custom_openid,
                msgtype: wxData.MsgType
            };

            if(wxData.MsgType == 'text'){
                params.content = jsonData.Content;
            }
            else if(wxData.MsgType == 'video' || wxData.MsgType == 'voice' || wxData.MsgType == 'image'){
                params.mediaId = wxData.MediaId;
            }
            else{

            }
            let access_token = await WechatService.accessToken(APPID, APPSECRET);
            await WechatService.sendCustomMessage(access_token, params);
        }
        else{
            console.log('4444444444444')
            //转到客服系统
            let xml = await WechatService.transfer_customer_service(wxData.ToUserName, wxData.FromUserName);
            console.log(xml);
            console.log('aaaaaaaaaaaaaaa')
            return xml;
        }
    }

    static async servicebind(wxData, APPID, APPSECRET){
        let param_str;
        if(jsonData.Content == '专属客服绑定') {
            param_str = 'bind_' + wxData.FromUserName;
        }
        else{
            param_str = 'unbind_' + wxData.FromUserName;
        }

        //生成二维码
        let access_token = await WechatService.accessToken(APPID, APPSECRET);
        let qrcode_img_url = await WechatService.qrcode(access_token, 'forever', param_str);

        //上传图片获取media_id，发送图片消息给客服
        let resUp = await WechatService.uploadMediaFile(access_token, qrcode_img_url);
        let params = {
            touser: wxData.FromUserName,
            msgtype: 'image',
            media_id: resUp.media_id
        }
        await WechatService.sendCustomMessage(access_token, params);
    }

    static async servicebtn(wxData, APPID, APPSECRET){
        let content;
        let info = await CustomServiceModel.findByCustomOpenid(wxData.FromUserName);
        if(info && info.service_openid && info.status == 'bind'){
            //已绑定客服，消息转发到专属客服微信
            //发送信息给专属客服
            let access_token = await WechatService.accessToken(APPID, APPSECRET);
            let params = {
                touser: info.service_openid,
                msgtype: 'text',
                content: '顾客XXX申请在线客服'
            }
            await WechatService.sendCustomMessage(access_token, params);

            //发给用户
            content = "您的专属客服是九指神丐，请在下方文本框输入您要咨询的消息";
        }
        else if(info && info.service_openid && info.status == 'unbind'){
            //专属客服已解绑（可随机分配等其他逻辑，看需求）
            content = "您的专属客服已离职，请在下方文本框输入您要咨询的消息到大众客服";
        }
        else{
            //消息转发到默认客服系统（可随机分配等其他逻辑，看需求）
            content = "请在下方文本框输入您要咨询的消息到大众客服";
        }
        let xml = await WechatService.reply(content, wxData.ToUserName, wxData.FromUserName);

        return xml;
    }

    static async serviceqrcode(wxData, param_str){
        if(param_str.indexOf('unbind') !== false){
            //解绑二维码，用于交接
            let original_openid = param_str.substring(6);
            await CustomServiceModel.updateCustomService(wxData.FromUserName, original_openid);
        }
        else{
            //绑定二维码
            let service_openid = param_str.substring(4);
            await CustomServiceModel.bindCustomService(wxData.FromUserName, service_openid);
        }
    }
}

export default WxController;