import BaseController from './BaseController';
import wxconf from '../config/wechat';
import WechatService from '../services/WechatService';
import WxpayService from '../services/WxpayService';
import CustomService from '../services/CustomService';
import InteractionService from '../services/InteractionService';
import rawBody from 'raw-body';
import UserModel from '../models/UserModel';
import WechatModel from '../models/WechatModel';
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

        //订阅号
        //const APPID = 'wx184c063cea04b3d4';
        //const APPSECRET = '4fd028f45d13e4a6a8cc40dcd07010de';

        //测试号
        const APPID = 'wx71cc2de74794ade8';
        const APPSECRET = '58d671c294af16e312132e588563fa4a';

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
                    let eventKey = jsonData.EventKey;
                    if(eventName == 'subscribe'){
                        //关注事件
                        let row = await WechatModel.findByOpenid(jsonData.FromUserName);
                        let access_token = await WechatService.accessToken(APPID, APPSECRET);
                        let userInfo = await WechatService.userInfoByOpenid(access_token, jsonData.FromUserName);
                        let subscribe = 'yes';
                        let sex = userInfo.sex == 1 ? 'man' : 'woman';
                        let address = userInfo.country + userInfo.province + userInfo.city;
                        let unionid = '';
                        if(!row){
                            //第一次关注
                            await WechatModel.insertOne(userInfo.openid, userInfo.nickname, sex, subscribe, userInfo.headimgurl, address, unionid);
                        }
                        else{
                            //之前关注过
                            await WechatModel.updateOne(userInfo.openid, userInfo.nickname, sex, subscribe, userInfo.headimgurl, address, unionid);
                        }

                        if(eventKey.indexOf('qrscene_') != -1){
                            //带参数二维码，绑定专属客服
                            let param_str = eventKey.substring(8);
                            if(param_str.indexOf('bind') != -1) {
                                replyMessageXml = await CustomService.serviceqrcode(jsonData, param_str);
                            }
                            else if(param_str.indexOf('sign') != -1){
                                replyMessageXml = await InteractionService.sign(jsonData, param_str);
                            }
                            ctx.type = 'application/xml';
                            ctx.body = replyMessageXml;
                        }
                    }
                    else if(eventName == 'unsubscribe'){
                        //取消关注事件
                        await WechatModel.updateSubscribeStatus(jsonData.FromUserName, 'no');
                    }
                    else if(eventName == 'scan'){
                        //用户已关注时的扫码事件推送
                        if(eventKey.indexOf('bind') != -1 && jsonData.Ticket){
                            //带参数二维码，绑定专属客服
                            let param_str = eventKey;
                            replyMessageXml = await CustomService.serviceqrcode(jsonData, param_str);
                            ctx.type = 'application/xml';
                            ctx.body = replyMessageXml;
                        }
                        else if(eventKey.indexOf('sign') != -1){
                            replyMessageXml = await InteractionService.sign(jsonData, eventKey);
                            ctx.type = 'application/xml';
                            ctx.body = replyMessageXml;
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
                        let eventKey = jsonData.EventKey;
                        switch (eventKey) {
                            case 'V1001_FIRST':
                                //单图文消息
                                replyMessageXml = await WechatService.reply({
                                    ToUserName: jsonData.FromUserName,
                                    FromUserName: jsonData.ToUserName,
                                    MsgType: 'news',
                                    Articles: [
                                        {
                                            Title: '欢迎光临',
                                            Description: '点击查看~',
                                            PicUrl: 'https://share.voc.so/app/images/t77_thumb@2x.png',
                                            Url: 'http://maoxy.com',
                                        }
                                    ]
                                });
                                ctx.type = 'application/xml';
                                ctx.body = replyMessageXml;
                                break;
                            case 'V1002_SECOND':
                                //多图文消息
                                replyMessageXml = await WechatService.reply({
                                    ToUserName: jsonData.FromUserName,
                                    FromUserName: jsonData.ToUserName,
                                    MsgType: 'news',
                                    Articles: [
                                        {
                                            Title: '欢迎光临1',
                                            Description: '点击查看~',
                                            PicUrl: 'https://share.voc.so/app/images/t77_thumb@2x.png',
                                            Url: 'http://maoxy.com',
                                        },
                                        {
                                            Title: '欢迎光临2',
                                            Description: '点击查看~',
                                            PicUrl: 'https://share.voc.so/app/images/t77_thumb@2x.png',
                                            Url: 'http://maoxy.com',
                                        },
                                        {
                                            Title: '欢迎光临3',
                                            Description: '点击查看~',
                                            PicUrl: 'https://share.voc.so/app/images/t77_thumb@2x.png',
                                            Url: 'http://maoxy.com',
                                        },
                                        {
                                            Title: '欢迎光临4',
                                            Description: '点击查看~',
                                            PicUrl: 'https://share.voc.so/app/images/t77_thumb@2x.png',
                                            Url: 'http://maoxy.com',
                                        }
                                    ]
                                });
                                ctx.type = 'application/xml';
                                ctx.body = replyMessageXml;
                                break;
                            case 'V2001_FIRST':
                                //文本消息
                                replyMessageXml = await WechatService.reply({
                                    ToUserName: jsonData.FromUserName,
                                    FromUserName: jsonData.ToUserName,
                                    MsgType: 'text',
                                    Content: '你好'
                                });
                                ctx.type = 'application/xml';
                                ctx.body = replyMessageXml;
                                break;
                            case 'V2002_SECOND':
                                //模板消息
                                let template_id = '0XX48AtUALAUdlLeOr3Xjn84FnawmWibvtc3PKY6gtY';
                                let access_token = await WechatService.accessToken(APPID, APPSECRET);
                                let body = {
                                    touser: jsonData.FromUserName,
                                    template_id: template_id,
                                    url: "https://www.baidu.com",
                                    data: {
                                        first: {
                                            value: '恭喜您竞猜成功',
                                            color: '#173177'
                                        },
                                        keyword1: {
                                            value: '2018-12-25',
                                            color: '#173177'
                                        },
                                        keyword2: {
                                            value: '迪士尼主题',
                                            color: '#173177'
                                        },
                                        keyword3: {
                                            value: '巴西夺冠',
                                            color: '#173177'
                                        },
                                        keyword4: {
                                            value: '巴西夺冠',
                                            color: '#173177'
                                        },
                                        remark: {
                                            value: '欢迎您再次竞猜',
                                            color: '#173177'
                                        }
                                    }
                                }
                                await WechatService.sendTemplateMessage(access_token, body);
                                ctx.body = 'success';
                                break;
                            case 'V3001_FIRST':
                                //music
                                replyMessageXml = await WechatService.reply({
                                    ToUserName: jsonData.FromUserName,
                                    FromUserName: jsonData.ToUserName,
                                    MsgType: 'music',
                                    Title: 'Lemon Tree',
                                    Description: '你好CAT',
                                    MusicUrl: 'http://mp3.com/xx.mp3',
                                    HQMusicUrl: '',
                                    ThumbMediaId: ''
                                });
                                ctx.type = 'application/xml';
                                ctx.body = replyMessageXml;
                                break;
                            case 'V3002_SECOND':
                                break;
                            case 'V3003_SERVICE':
                                //用户点击专属客服按钮
                                replyMessageXml = await CustomService.servicebtn(jsonData, APPID, APPSECRET);
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
                    replyMessageXml = await CustomService.servicetrans(jsonData, APPID, APPSECRET);
                    if(replyMessageXml) {
                        ctx.type = 'application/xml';
                        ctx.body = replyMessageXml;
                    }
                    else{
                        ctx.body = 'success';
                    }
                    break;
                case 'link':
                    break;
                case 'voice':
                    replyMessageXml = await CustomService.servicetrans(jsonData, APPID, APPSECRET);
                    if(replyMessageXml) {
                        ctx.type = 'application/xml';
                        ctx.body = replyMessageXml;
                    }
                    else{
                        ctx.body = 'success';
                    }
                    break;
                case 'video':
                    replyMessageXml = await CustomService.servicetrans(jsonData, APPID, APPSECRET);
                    if(replyMessageXml) {
                        ctx.type = 'application/xml';
                        ctx.body = replyMessageXml;
                    }
                    else{
                        ctx.body = 'success';
                    }
                    break;
                case 'text':
                    content = jsonData.Content;
                    if(content == '专属客服绑定' || content == '专属客服解绑'){
                        //生成专属客服二维码（带参数）参数 openid的16位MD5值
                        replyMessageXml = await CustomService.servicebind(jsonData, APPID, APPSECRET);
                        if(replyMessageXml) {
                            ctx.type = 'application/xml';
                            ctx.body = replyMessageXml;
                        }
                        else{
                            ctx.body = 'success';
                        }
                    }
                    else if(content == '签到'){
                        console.log('00000000000');
                        replyMessageXml = await InteractionService.qrcode(jsonData, APPID, APPSECRET);
                        if(replyMessageXml) {
                            ctx.type = 'application/xml';
                            ctx.body = replyMessageXml;
                        }
                        else{
                            ctx.body = 'success';
                        }
                    }
                    else{
                        replyMessageXml = await CustomService.servicetrans(jsonData, APPID, APPSECRET);
                        if(replyMessageXml) {
                            ctx.type = 'application/xml';
                            ctx.body = replyMessageXml;
                        }
                        else{
                            ctx.body = 'success';
                        }
                    }
                    break;
                case 'location':
                    break;
                default:
                    break;
            }
        }
    }

    static async jssdk(ctx){
        ctx.body = ctx.request.body;
        //let APPID = wxconf.appID;
        //let APPSECRET = wxconf.appSecret;
        let APPID = 'wx184c063cea04b3d4';
        let APPSECRET = '4fd028f45d13e4a6a8cc40dcd07010de';
        let url = ctx.body.url;
        let jssdk;
        if(url) {
            jssdk = await WechatService.jssdk(url, APPID, APPSECRET);
        }

        return ctx.success({
            msg:'操作成功',
            data: {
                jssdk
            }
        });
    }

    static async outhurl(ctx){
        ctx.body = ctx.request.body;
        let { type, state, redirect_uri } = ctx.body;
        //let APPID = wxconf.appID;
        const APPID = 'wx71cc2de74794ade8';
        const APPSECRET = '58d671c294af16e312132e588563fa4a';

        let url;
        if(type == 'base'){
            url = await WechatService.oauthBase(APPID, redirect_uri, state);
        }
        else{
            url = await WechatService.oauthUserinfo(APPID, redirect_uri, state);
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
        //let APPID = wxconf.appID;
        //let APPSECRET = wxconf.appSecret;

        const APPID = 'wx71cc2de74794ade8';
        const APPSECRET = '58d671c294af16e312132e588563fa4a';

        let secret = process.env.SECRET;
        let tokenInfo = await WechatService.authInfoByCode(code, APPID, APPSECRET);
        let rtn = {};
        if(tokenInfo && tokenInfo.access_token) {
            let key = Common.md5(tokenInfo.openid + secret);
            redis.set(key, tokenInfo.openid, 2 * 3600);
            rtn.sessionkey = key;
            if (type != 'base') {
                let info = await WechatService.userInfoByOauth(tokenInfo.openid, tokenInfo.access_token);
                if(info && info.openid) {
                    rtn.nickname = info.nickname;
                    rtn.sex = info.sex;
                    rtn.province = info.province;
                    rtn.city = info.city;
                    rtn.country = info.country;
                    rtn.headimgurl = info.headimgurl;
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

    static async menu(ctx){
        //let APPID = wxconf.appID;
        //let APPSECRET = wxconf.appSecret;
        const APPID = 'wx71cc2de74794ade8';
        const APPSECRET = '58d671c294af16e312132e588563fa4a';
        let access_token = await WechatService.accessToken(APPID, APPSECRET);
        let menu_body = {
            "button":[
                {
                    "name":"公共查询",
                    "sub_button":[
                        {
                            "type":"click",
                            "name":"单图文消息",
                            "key":"V1001_FIRST"
                        },
                        {
                            "type":"click",
                            "name":"多图文消息",
                            "key":"V1002_SECOND"
                        },
                        {
                            "type":"view",
                            "name":"微信支付",
                            "url":"http://wxpay.maoxy.com"
                        }]
                },
                {
                    "name":"微信查询",
                    "sub_button":[
                        {
                            "type":"scancode_push",
                            "name":"扫一扫",
                            "key":"scancode_push"
                        },
                        {
                            "type":"click",
                            "name":"文本消息",
                            "key":"V2001_FIRST"
                        },
                        {
                            "type":"click",
                            "name":"模板消息",
                            "key":"V2002_SECOND"
                        }]
                },
                {
                    "type":"click",
                    "name":"联系我们",
                    "key":"V3003_SERVICE"
                }
            ]
        };
        let res = await WechatService.menu(access_token, menu_body);
        if(res){
            ctx.body = "创建成功"
        }
        else{
            ctx.body = "创建失败"
        }
    }

    static async service(ctx){
        const APPID = 'wx71cc2de74794ade8';
        const APPSECRET = '58d671c294af16e312132e588563fa4a';
        let access_token = await WechatService.accessToken(APPID, APPSECRET);
        //let rd = Math.random() * 1000;
        let rd = 1;
        let kflist = await WechatService.kflist(access_token);
        let addkf = await WechatService.addkf(access_token, {
            "kf_account" : rd + "_service@gh_f2f330d21ef7",
            "nickname" : "客服" + rd
        });
        let invitekf = await WechatService.invitekf(access_token, {
            "kf_account": rd + "_service@gh_f2f330d21ef7",
            "invite_wx" : 'cat514176213'
        });

        console.log('0000000000')
        console.log(kflist)

        console.log('1111111111')
        console.log(addkf)

        console.log('2222222222222')
        console.log(invitekf)


        if(addkf){
            ctx.body = "创建成功"
        }
        else{
            ctx.body = "创建失败"
        }
    }
}

export default WxController;