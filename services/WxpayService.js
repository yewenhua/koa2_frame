/**
 * Created by Administrator on 2019/2/21.
 */

import xml2js from 'xml2js';
import request from 'superagent';
import Common from '../utils/common';
const logUtil = require('../utils/LogUtil');

class WxpayService {
    static async prepay(params){
        const appId = params.appId;
        const appSecret = params.appSecret;
        // 商户号
        const mchId = params.mchId;
        // 支付的 key
        const PAY_API_KEY = params.payApiKey;
        // attach 是一个任意的字符串, 会原样返回, 可以用作一个标记
        const attach = params.attach;
        // 一个随机字符串
        const nonceStr = await WxpayService.nonceStr();
        // 用户的 openId
        const openId = params.openId;
        // 生成商家内部自定义的订单号, 商家内部的系统用的, 不用 attach 加入也是可以的
        const tradeId = params.tradeId;
        // 生成签名
        let ip = params.ip || '';

        let productIntro = params.productIntro || 'pay for goods';
        let notifyUrl = params.notifyUrl;
        let price = params.price || 1;
        let signParams = {
            appid: appId,
            attach: attach,
            body: productIntro,
            mch_id: mchId,
            nonce_str: nonceStr,
            notify_url: notifyUrl,
            openid: openId,
            out_trade_no: tradeId,
            spbill_create_ip: ip,
            total_fee: price,
            trade_type: 'JSAPI'
        };
        const sign = await WxpayService.sign(signParams, PAY_API_KEY);

        //将微信需要的数据拼成 xml 发送出去
        const sendData = await WxpayService.prePaySendData(appId, attach, productIntro, mchId, nonceStr, notifyUrl, openId, tradeId, ip, price, sign);
        let url = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
        let rtnData = await request.post(url)
            .set('Content-Type', 'application/xml')
            .send(sendData);

        console.log('00000000000');
        console.log(rtnData);
        if (rtnData.status == 200 && rtnData.text) {
            let rtn = JSON.parse(rtnData.text);
            console.log('1111111111111');
            console.log(rtn);
            return rtn;
        }
        else{
            return null;
        }
    }

    static async notify(params, PAY_API_KEY){
        let status;
        let msg;
        let res = await WxpayService.checkSign(params, PAY_API_KEY);
        if(res){
            if(params['return_code'] && params['return_code'] == 'SUCCESS' && params['result_code'] && params['result_code'] == 'SUCCESS'){
                status = 'SUCCESS';
                msg = 'OK';
            }
            else{
                status = 'FAIL';
                msg = 'ERROR';
            }
        }
        else{
            status = '签名失败';
            msg = 'ERROR';
        }

        const rtn = '<xml>' +
            '<return_code>' + status + '</return_code>' +
            '<return_msg>' + msg + '</return_msg>' +
            '</xml>';

        return rtn;
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
        let stringA = await WechatService.raw(params);
        let stringSignTemp = stringA + '&key=' + PAY_API_KEY;
        let sign = Common.md5(stringSignTemp).toUpperCase();
        return sign;
    }

    static async prePaySendData(appId, attach, productIntro, mchId, nonceStr, notifyUrl, openId, tradeId, ip, price, sign) {
        const sendData = '<xml>' +
            '<appid>' + appId + '</appid>' +
            '<attach>' + attach + '</attach>' +
            '<body>' + productIntro + '</body>' +
            '<mch_id>' + mchId + '</mch_id>' +
            '<nonce_str>' + nonceStr + '</nonce_str>' +
            '<notify_url>' + notifyUrl + '</notify_url>' +
            '<openid>' + openId + '</openid>' +
            '<out_trade_no>' + tradeId + '</out_trade_no>' +
            '<spbill_create_ip>' + ip + '</spbill_create_ip>' +
            '<total_fee>' + price + '</total_fee>' +
            '<trade_type>JSAPI</trade_type>' +
            '<sign>' + sign + '</sign>' +
            '</xml>';
        return sendData;
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
        let stringA = await WechatService.raw(signParams);
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

    }

    static async scanPayCb(cbData, parameters){
        let payApiKey = parameters.payApiKey;
        let rtn = null;
        let check = await WxpayService.checkSign(cbData, payApiKey);
        if(!check){
            let openid = cbData.openid;
            let product_id = cbData.product_id;
            let type = 'NATIVE';
            let params = {
                openid: openid,
                appId: parameters.appId,
                mchId: parameters.mchId,
                type: type
                //...
            };
            let prepayInfo = await WxpayService.prepay(params);
            if(prepayInfo && prepayInfo.prepay_id){
                rtn = {
                    return_code: 'SUCCESS',
                    result_code: 'SUCCESS',
                    prepay_id: prepayInfo.prepay_id,
                    appid: parameters.appId,
                    mch_id: parameters.mchId,
                    nonce_str: cbData.nonce_str,
                    sign: cbData.sign
                };
            }
            else{
                rtn = {
                    return_code: 'FAIL',
                    return_msg: 'PAY FAIL'
                };
            }
        }
        else{
            rtn = {
                return_code: 'FAIL',
                return_msg: 'SIGN FAIL'
            };
        }

        let res = await WxpayService.parseJson2XML(rtn);
        return res;
    }
}

export default WxpayService;