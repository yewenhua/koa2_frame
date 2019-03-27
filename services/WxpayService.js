/**
 * Created by Administrator on 2019/2/21.
 */

import QRCode from 'qrcode';
import xml2js from 'xml2js';
import request from 'superagent';
import Common from '../utils/common';
const logUtil = require('../utils/LogUtil');

class WxpayService {
    static async prepay(params){
        const appId = params.appId;
        // 商户号
        const mchId = params.mchId;
        // 支付的 key
        const PAY_API_KEY = params.payApiKey;
        // attach 是一个任意的字符串, 会原样返回, 可以用作一个标记
        const attach = params.attach;
        // 一个随机字符串
        const nonceStr = await WxpayService.nonceStr();
        // 生成商家内部自定义的订单号, 商家内部的系统用的, 不用 attach 加入也是可以的
        const tradeId = params.tradeId;
        // 生成签名
        let ip = params.ip || '';

        let body = params.body || 'pay for goods';
        let notifyUrl = params.notifyUrl;
        let price = params.price || 1;
        let signParams = {
            appid: appId,
            mch_id: mchId,
            nonce_str: nonceStr,
            body: body,
            attach: attach,
            out_trade_no: tradeId,
            total_fee: price,
            spbill_create_ip: ip,
            notify_url: notifyUrl,
            trade_type: params.type
        };

        if(params.type == 'JSAPI'){
            signParams.openid = params.openId;
        }
        else if(params.type == 'NATIVE'){
            signParams.product_id = params.product_id;
        }

        const sign = await WxpayService.sign(signParams, PAY_API_KEY);

        //将微信需要的数据拼成 xml 发送出去
        signParams.sign = sign;
        let sendData = await WxpayService.parseJson2XML(signParams);
        let url = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
        let rtnData = await request.post(url)
            .set('Content-Type', 'application/xml')
            .send(sendData);

        let res = null;
        if (rtnData.status == 200 && rtnData.text) {
            let rtn = JSON.parse(rtnData.text);
            if(rtn.return_code && rtn.return_code == 'SUCCESS' && rtn.result_code && rtn.result_code == 'SUCCESS') {
                let check = await WxpayService.checkSign(rtn, PAY_API_KEY);
                if(check){
                    res = rtn;
                }
            }
        }

        return res;
    }

    static async notify(params, PAY_API_KEY){
        let flag = false;
        if(params.return_code && params.return_code == 'SUCCESS') {
            let check = await WxpayService.checkSign(params, PAY_API_KEY);
            if (check) {
                if (params['result_code'] && params['result_code'] == 'SUCCESS') {
                    flag = true;
                }
            }
        }

        return flag;
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

    static async parseJson2XML(json) {
        return new Promise((resolve, reject) => {
            var builder = new xml2js.Builder();
            var xml = builder.buildObject(json);
            resolve(xml);
        });
    }

    static async nonceStr() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 16; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    static async tradeId(attach) {
        var date = new Date().getTime().toString();
        var text = "";
        var possible = "0123456789";
        for (var i = 0; i < 5; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        var tradeId = 'ty_' + attach + '_' + date + text;
        return tradeId;
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

    static async sign(params, PAY_API_KEY) {
        let stringA = await WxpayService.raw(params);
        let stringSignTemp = stringA + '&key=' + PAY_API_KEY;
        let sign = Common.md5(stringSignTemp).toUpperCase();
        return sign;
    }

    /*
     * 设置前端jsapi的参数
     */
    static async payParams(appId, prepayId, tradeId, PAY_API_KEY) {
        const nonceStr = await WxpayService.nonceStr();
        const timeStamp = parseInt(new Date().getTime() / 1000) + '';
        const pkg = 'prepay_id=' + prepayId;
        let signParams = {
            appId: appId,
            nonceStr: nonceStr,
            package: pkg,
            timeStamp: timeStamp,
            signType: 'MD5'
        }
        const paySign = await WxpayService.sign(signParams, PAY_API_KEY);
        // 前端需要的所有数据, 都从这里返回过去
        const payParamsObj = {
            appId: appId,
            nonceStr: nonceStr,
            timeStamp: timeStamp,
            package: pkg,
            paySign: paySign,
            signType: 'MD5',
            tradeId: tradeId,
        }
        return payParamsObj;
    }

    static async checkSign(xmlObj, PAY_API_KEY) {
        let string = '';
        const keys = Object.keys(xmlObj);
        keys.sort();
        keys.forEach(key => {
            if (xmlObj[key] && key !== 'sign') {
                string = string + key + '=' + xmlObj[key] + '&';
            }
        })
        string = string + 'key=' + PAY_API_KEY;
        const localSign = Common.md5(string).toUpperCase();
        console.log('777777777777');
        console.log(string);
        console.log(localSign);
        return localSign === xmlObj.sgin;
    }

    static async createPayQrcodeUrl(params){
        const appId = params.appId;
        const mchId = params.mchId;
        const nonceStr = await WxpayService.nonceStr();
        const timeStamp = parseInt(new Date().getTime() / 1000) + '';
        const product_id = params.product_id;
        const PAY_API_KEY = params.payApiKey;

        let signParams = {
            appid: appId,
            mch_id: mchId,
            nonce_str: nonceStr,
            time_stamp: timeStamp,
            product_id: product_id
        };
        const sign = await WxpayService.sign(signParams, PAY_API_KEY);
        signParams['sign'] = sign;
        let stringA = await WxpayService.raw(signParams);
        let long_url = "weixin://wxpay/bizpayurl?" + stringA;
        return long_url;
    }

    static async createShortUrl(params){
        const appId = params.appId;
        const mchId = params.mchId;
        const nonceStr = await WxpayService.nonceStr();
        const long_url = params.long_url;
        const PAY_API_KEY = params.payApiKey;
        const url = "https://api.mch.weixin.qq.com/tools/shorturl";

        let signParams = {
            appid: appId,
            mch_id: mchId,
            nonce_str: nonceStr,
            long_url: long_url
        };
        const sign = await WxpayService.sign(signParams, PAY_API_KEY);
        signParams['sign'] = sign;
        let sendData = await WxpayService.parseJson2XML(signParams);
        let rtnData = await request.post(url)
            .set('Content-Type', 'application/xml')
            .send(sendData);

        let res = null;
        if (rtnData.status == 200 && rtnData.text) {
            let rtn = JSON.parse(rtnData.text);
            if(rtn.return_code && rtn.return_code == 'SUCCESS' && rtn.result_code && rtn.result_code == 'SUCCESS') {
                let check = await WxpayService.checkSign(rtn, PAY_API_KEY);
                if(check){
                    res = rtn.short_url;
                }
            }
        }

        return res;
    }

    static async scanPayCb(cbData, params){
        console.log('3333333333');
        console.log(cbData);
        console.log(params);
        let replyParams = {
            appid: cbData.appid,
            mch_id: cbData.mch_id,
            nonce_str: cbData.nonce_str,
            prepay_id: ''
        };
        let check = await WxpayService.checkSign(cbData, params.payApiKey);
        if(check){
            console.log('5555555555');
            let product_id = cbData.product_id;
            let attach = 'scan_' + product_id;
            let tradeId = await WxpayService.tradeId(attach);

            let prepayParams = {
                appId: cbData.appid,
                mchId: cbData.mch_id,
                payApiKey: params.payApiKey,
                tradeId: tradeId,
                product_id: cbData.product_id,
                attach: attach,
                body: 'native pay goods',
                notifyUrl: params.notify_url,
                type: 'NATIVE',
                price: params.price,
                ip: params.ip
            };
            let prepayInfo = await WxpayService.prepay(prepayParams);
            if(prepayInfo && prepayInfo.data.prepay_id){
                replyParams.return_code = 'SUCCESS';
                replyParams.result_code = 'SUCCESS';
                replyParams.prepay_id = prepayInfo.data.prepay_id;
            }
            else{
                replyParams.return_code = 'FAIL';
                replyParams.result_code = 'FAIL';
                replyParams.err_code_des = '生成统一订单错误';
            }
        }
        else{
            console.log('66666666666');
            replyParams.return_code = 'FAIL';
            replyParams.result_code = 'FAIL';
            replyParams.err_code_des = '签名错误';
        }

        let sign = await WxpayService.prepay(replyParams);
        replyParams.sign = sign;
        let replayXml = await WxpayService.parseJson2XML(replyParams);
        return replayXml;
    }

    static async generateQrcode(url){
        let img_src = await QRCode.toDataURL(url, {
            margin: 0
        });
        return img_src;
    }
}

export default WxpayService;