import jwt from 'jsonwebtoken';
import CryptoJs from 'crypto-js';
import UserModel from '../models/UserModel'
import BaseController from './BaseController';
import Common from '../utils/common';
import redis from '../utils/redis';
const logUtil = require('../utils/LogUtil');

/*
 * UserController
 * 静态方法并不需要实例化就可以访问 使用static，你不需要new，你可以减少内存的损耗
 */

class UserController extends BaseController{

    // refresh
    static async refresh(ctx) {
        // await ……
        ctx.body = ctx.request.body;
        let secret = process.env.SECRET;
        let refresh_token = ctx.body.refresh_token;
        let key = Common.md5(refresh_token + secret);
        let cacheValue = await redis.get(key);
        let payload = jwt.verify(cacheValue, secret);
        let row = await UserModel.findById(payload.id);
        if(row && row.password){
            let refresh_token = jwt.sign({
                id: row.id
            }, secret, { expiresIn: '4h' });
            let token = jwt.sign({
                id: row.id,
                uid: row.uid,
                combo_id: row.combo_id,
                mobile: row.mobile,
                email: row.email,
                begin: row.begin,
                end: row.end,
                count: row.count,
                point: row.point,
                isopen: row.isopen
            }, secret, { expiresIn: '2h' });
            let key = Common.md5(refresh_token + secret);
            redis.set(key, refresh_token, 2 * 24 * 3600);

            return ctx.success({
                msg:'刷新成功',
                data: {
                    token,
                    refresh_token
                }
            });
        }
        else{
            return ctx.success({
                code: 10001,
                msg:'刷新失败',
                data: null
            });
        }
    }

    // 用户登录
    static async login(ctx) {
        // await ……
        ctx.body = ctx.request.body;
        let secret = process.env.SECRET;
        let username = ctx.body.username;
        let password = ctx.body.password;

        let decodePwd = Common.decAse192(password, secret);
        let encodePwd = Common.md5(decodePwd);
        let row = await UserModel.Login(username, encodePwd);

        let refresh_token;
        let token;
        let flag = false;
        if(row && row.password){
            let payloadRefresh = {
                id: row.id
            }
            let payloadToken = {
                id: row.id,
                uid: row.uid,
                combo_id: row.combo_id,
                mobile: row.mobile,
                email: row.email,
                begin: row.begin,
                end: row.end,
                count: row.count,
                point: row.point,
                isopen: row.isopen
            };
            if(row.active_time){
                //已激活
                refresh_token = jwt.sign(payloadRefresh, secret, { expiresIn: '48h' });
                token = jwt.sign(payloadToken, secret, { expiresIn: '2h' });
                let key = Common.md5(refresh_token + secret);
                redis.set(key, refresh_token, 2 * 24 * 3600);
                flag = true;
            }
            else{
                //未激活，先激活
                let res = await UserModel.Activate();
                if(res.id){
                    refresh_token = jwt.sign(payloadRefresh, secret, { expiresIn: '48h' });
                    token = jwt.sign(payloadToken, secret, { expiresIn: '2h' });
                    let key = Common.md5(refresh_token + secret);
                    redis.set(key, refresh_token, 2 * 24 * 3600);
                    flag = true;
                }
            }
        }

        if(flag){
            return ctx.success({
                msg:'登录成功',
                data: {
                    token,
                    refresh_token
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

    // 用户退出
    static async logout(ctx) {
        // await ……
        const user = ctx.user;  //通过中间件filter获取用户信息
    }

    // 更新用户资料
    static async put(ctx) {
        // await ……
    }

    // 删除用户
    static async deluser(ctx) {
        // await ……
    }

    // 重置密码
    static async resetpwd(ctx) {
        // await ……
    }
}

export default UserController;