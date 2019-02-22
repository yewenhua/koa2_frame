import jwt from 'jsonwebtoken';
import UserModel from '../models/UserModel'
import BaseController from './BaseController'
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
        let row = await UserModel.findByName('jack');

        const token = jwt.sign({
            name: 'cat',
            id: 1
        }, 'my_secret', { expiresIn: '2h' });

        let payload = jwt.verify(token, 'my_secret');

        return ctx.success({
            msg:'登录成功' + row.userName,
            data: {
                token,
                payload
            }
        });
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