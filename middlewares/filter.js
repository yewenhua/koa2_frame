const jwt = require('jsonwebtoken');
const secret = process.env.SECRET;
const util = require('util');

const logUtil = require('../utils/LogUtil');

/**
 * 判断token是否可用
 */
module.exports = function () {
    return async function (ctx, next) {
        //响应开始时间
        const start = new Date();
        //响应间隔时间
        let ms;

        try {
            const token = ctx.header.authorization;  // 获取jwt
            if(token) {
                let payload;
                payload = jwt.verify(token.split(' ')[1], secret);  // 解密payload，获取用户
                ctx.user = payload;
            }

            await next();
            ms = new Date() - start;
            //记录响应日志
            logUtil.logResponse(ctx, ms);
        } catch (err) {
            ms = new Date() - start;
            //记录异常日志
            logUtil.logError(ctx, err, ms);

            if (!err) {
                return ctx.error({ msg:new Error('未知错误!') });
            }

            if (err.status === 401) {
                ctx.error({msg:'认证失败!',error: err, status: ctx.status });
            } else {
                ctx.error({msg:'服务器错误!',error: err, status: ctx.status });
            }
        }
    }
}