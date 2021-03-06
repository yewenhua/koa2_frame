import BaseController from './BaseController';
import miniconf from '../config/mini';
import MiniService from '../services/MiniService';
import UtilsService from '../services/UtilsService';
import Common from '../utils/common';
import redis from '../utils/redis';
import MiniuserModel from '../models/mall/MiniuserModel';

const logUtil = require('../utils/LogUtil');

class MiniController extends BaseController{
    static async minilogin(ctx){
        ctx.body = ctx.request.body;
        let { code } = ctx.body;
        let APPID = miniconf.appID;
        let APPSECRET = miniconf.appSecret;
        let rtn = await MiniService.openidAndSessionkey(APPID, APPSECRET, code);
        if(rtn && rtn.openid){
            let secret = process.env.SECRET;
            let key = Common.md5(rtn.openid + secret);
            let value = {
                openid: rtn.openid,
                session_key: rtn.session_key
            };
            redis.set(key, JSON.stringify(value), 2 * 24 * 3600);
            let row = await MiniuserModel.findByOpenId(rtn.openid);
            if(!row){
                let code = await UtilsService.random_str(6);
                let parent_key = process.env.DEFAULT_PARENT;
                await MiniuserModel.insertOne({
                    openid: rtn.openid,
                    nickname: '',
                    gender: 0,
                    avatarurl: '',
                    city: '',
                    province: '',
                    country: '',
                    code: code,
                    parent_key: parent_key
                });
            }

            return ctx.success({
                msg:'登录成功',
                data: {
                    third_session: key
                }
            });
        }
        else{
            return ctx.success({
                code: 10001,
                msg:'登录失败',
                data: null
            });
        }
    }
}

export default MiniController;