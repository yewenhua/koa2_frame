import jwt from 'jsonwebtoken';
import CryptoJs from 'crypto-js';
import UserModel from '../models/UserModel'
import BaseController from './BaseController';
import Common from '../utils/common';
const logUtil = require('../utils/LogUtil');
/*
 * UserController
 * 静态方法并不需要实例化就可以访问 使用static，你不需要new，你可以减少内存的损耗
 */

class UserController extends BaseController{

    // 用户注册
    static async register(ctx) {
        // await ……
    }

    // 用户登录
    static async login(ctx) {
        // await ……
        let secret = process.env.SECRET;
        let username = ctx.body.username;
        let password = ctx.body.password;
        let decodeBytes = CryptoJs.AES.decrypt(password, secret);
        let decodePwdText = decodeBytes.toString(CryptoJs.enc.Utf8);
        let encodePwd = Common.md5(decodePwdText);
        let row = await UserModel.Login(username, encodePwd);
        if(row && row.password){
            const token = jwt.sign({
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

            return ctx.success({
                msg:'登录成功',
                data: {
                    token
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
        const token = ctx.header.authorization;
        let payload = jwt.verify(token.split(' ')[1], 'my_secret');
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