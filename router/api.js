import Router from 'koa-router'
import UserCtrl from '../controllers/UserController';
import ImageCtrl from '../controllers/ImageController';

const api = new Router({
    prefix: '/api'
})

api.get('/get', ctx => {
        //crx.query 是用于获取get请求的参数
        ctx.body = ctx.query;
        ws.io.emit('message', {
            type: 'system',
            content: 'from system'
        });

        ctx.response.body = 'this is api get page';
    })
    .post('/post', ctx => {
        //ctx.request.body 用于获取post的参数
        ctx.body = ctx.request.body;
        ctx.response.body = 'this is api post page';
    })
    .post('/login', UserCtrl.login)
    .post('/refresh', UserCtrl.refresh)
    .post('/upload', ImageCtrl.upload)
    .post('/transfer', ImageCtrl.transfer)
    .post('/querylist', ImageCtrl.querylist)
    .get('/word', UserCtrl.word)
    .post('/wxtrans', ImageCtrl.wxtrans)


export default api;