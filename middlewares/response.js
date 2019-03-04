/*
 * @ author cat
 * @ use 统一响应请求中间件
 * @ error-data 返回错误时，可携带的数据
 * @ error-msg  自定义的错误提示信息
 * @ error-status 错误返回码
 * @ error-errdata 可返回服务器生成的错误
 * @ success-data  请求成功时响应的数据
 * @ success-msg  请求成功时响应的提示信息
 * @ 调用ctx.error()   响应错误
 * @ 调用ctx.success()  响应成功
 */

module.exports = async (ctx, next) => {
    ctx.error = ({ data, msg, status, error, code }) => {
        ctx.status= status || 200;
        ctx.body = { code: code || -1, msg, data, error };
    }
    ctx.success = ({ data, msg }) => {
        ctx.body = { code: 0, msg, data };
    }
    await next();
}