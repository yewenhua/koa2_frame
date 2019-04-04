const Koa = require('koa');
const http = require('http');
const socketIo = require('socket.io');
const koaRouter = require('koa-router');
const cors = require('koa2-cors');
const path = require('path');
const koaStatic = require('koa-static');
const koaJwt = require('koa-jwt');
const app = new Koa();
const router = new koaRouter();

import convert from 'koa-convert';   //比较老的使用Generate函数的koa中间件(< koa2)，官方提供了一个灵活的工具可以将他们转为基于Promise的中间件供Koa2使用
import json from 'koa-json';
import koaBody from 'koa-body';

import admin from './router/admin'
import api from './router/api'
import wechat from './router/wechat'

import filter from './middlewares/filter'
import response from './middlewares/response'
import SocketService from './services/SocketService';
const logUtil = require('./utils/LogUtil');

//如果原来是用app.listen(3000);来启动服务，现在要改成用http来启动server
const server = http.createServer(app.callback());

//挂载socket
global.ws = {
    io: socketIo(server),
    count: 0,
    onlineUsers: {},
    onlineSockets: {}
};
SocketService(ws);


//跨域
app.use(cors());

//统一处理响应请求 (成功/失败)
app.use(response);

app.use(filter());

//path.join 拼接路径，并返回该路径
const staticFun = convert(koaStatic(path.join(__dirname, 'static')));
app.use(staticFun);

//token验证 失败的时候会抛出401错误，因此需要添加错误处理，而且要放在 app.use(koajwt()) 之前，否则不执行
app.use(koaJwt({
    secret: process.env.SECRET
}).unless({
    path: [
        /^\/api\/get/,
        /^\/api\/login/,
        /^\/api\/forget/,
        /^\/wechat\/entry/,
        /^\/wechat\/token/,
        /^\/wechat\/wxpay/,
        /^\/wechat\/outhurl/,
        /^\/wechat\/outhinfo/,
        /^\/wechat\/notify/,
        /^\/wechat\/scanpayurl/,
        /^\/wechat\/scanpaycb/,
        /^\/api\/word/,
        /^\/api\/wxtrans/,
        /^\/api\/upload/,
        /^\/api\/minilogin/
    ]
    //数组中的路径不需要通过jwt验证
}));


// 传输JSON
app.use(convert(json()));

// body解析
app.use(koaBody({
    multipart:true, // 支持文件上传
    formidable:{
        uploadDir: path.join(__dirname, 'static/upload/'), // 设置文件上传目录
        keepExtensions: true,    // 保持文件的后缀
        maxFieldsSize: 10 * 1024 * 1024, // 文件上传大小
    }
}));


app.use(admin.routes()).use(admin.allowedMethods());
app.use(api.routes()).use(api.allowedMethods());
app.use(wechat.routes()).use(wechat.allowedMethods());

app.on('error', function(err, ctx){
    //如果错误被try-catch捕获，就不触发error事件，这时必须调用ctx.app.emit(),手动释放error事件
    logUtil.logDebug('=========ERROR=========');
    logUtil.logDebug(JSON.stringify(err));
    console.log(err);
});



server.listen(3000);