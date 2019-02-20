import Router from 'koa-router'
import wxconf from '../config/wechat';
import Wechat from '../services/Wechat';
import rawBody from 'raw-body';

const wechat = new Router({
    prefix: '/wechat'
})

wechat.get('/entry', async ctx => {
        const { signature, timestamp, nonce, echostr } = ctx.query;
        const TOKEN = wxconf.token;
        if (signature === Wechat.checkSignature(timestamp, nonce, TOKEN)) {
            return ctx.body = echostr;
        }
        else{
            ctx.status = 401
            ctx.body = 'Invalid signature';
        }
    })
    .post('/entry', async ctx => {
        const { signature, timestamp, nonce, echostr } = ctx.query;
        const TOKEN = wxconf.token;
        if (signature !== Wechat.checkSignature(timestamp, nonce, TOKEN)) {
            ctx.status = 401;
            ctx.body = 'Invalid signature';
        }
        else{
            const xml = await rawBody(ctx.req, {
                length: ctx.request.length,
                limit: '1mb',
                encoding: ctx.request.charset || 'utf-8'
            });
            const jsonData = await Wechat.parseXML2Json(xml);
            let content = '';
            const replyMessageXml = reply(content, jsonData.ToUserName, jsonData.FromUserName);
            ctx.body = replyMessageXml;
        }
    })


export default wechat