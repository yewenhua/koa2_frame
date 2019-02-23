import jwt from 'jsonwebtoken';
import ImageModel from '../models/ImageModel'
import BaseController from './BaseController'
const logUtil = require('../utils/LogUtil');

/*
 * ImageController
 * 静态方法并不需要实例化就可以访问 使用static，你不需要new，你可以减少内存的损耗
 */

class ImageController extends BaseController{

    // 用户注册
    static async delete(ctx) {
        // await ……
    }

    // 用户登录
    static async upload(ctx) {
        // await ……
        console.log('=================');
        logUtil.logDebug('888888888888');



        return ctx.success({
            msg:'登录成功',
            data: {
                token: '9999999999'
            }
        });
    }
}

export default ImageController;