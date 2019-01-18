const Koa = require('koa');
const koaRouter = require('koa-router');
const cors = require('koa-cors');
const path = require('path');
const koaStatic = require('koa-static');
const koaJwt = require('koa-jwt');
const app = new Koa();
const router = new koaRouter();

import convert from 'koa-convert';   //比较老的使用Generate函数的koa中间件(< koa2)，官方提供了一个灵活的工具可以将他们转为基于Promise的中间件供Koa2使用
import json from 'koa-json';
import bodyParser from 'koa-bodyparser';

import admin from './router/admin'
import api from './router/api'
import web from './router/web'

import filter from './middlewares/filter'
import response from './middlewares/response'
import logUtil from './utils/logUtil';

//跨域
app.use(convert(cors()));

//统一处理响应请求 (成功/失败)
app.use(response);

app.use(filter());

//path.join 拼接路径，并返回该路径
const staticFun = convert(koaStatic(path.join(__dirname, 'static')));
app.use(staticFun);

//token验证 失败的时候会抛出401错误，因此需要添加错误处理，而且要放在 app.use(koajwt()) 之前，否则不执行
app.use(koaJwt({
    secret: 'my_secret'
}).unless({
    path: [/^\/api\/login/, /^\/api\/forget/] //数组中的路径不需要通过jwt验证
}));


// 传输JSON
app.use(convert(json()));

// body解析
app.use(bodyParser());


app.use(admin.routes()).use(admin.allowedMethods());
app.use(api.routes()).use(api.allowedMethods());
app.use(web.routes()).use(web.allowedMethods());

app.on('error', function(err, ctx){
    //如果错误被try-catch捕获，就不触发error事件，这时必须调用ctx.app.emit(),手动释放error事件
    logUtil.logDebug('=========ERROR=========');
    logUtil.logDebug(JSON.stringify(err));
});



app.listen(3000);