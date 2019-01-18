import BaseController from './BaseController'
import sha1 from 'sha1'

const logUtil = require('../utils/logUtil');

class WxController extends BaseController{
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