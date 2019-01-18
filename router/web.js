import Router from 'koa-router'

const web = new Router({
    prefix: '/web'
})

web.get('/get', ctx => {
        ctx.response.type = 'html';
        ctx.response.body = '<a href="/api/get">api get Page</a>';
    })
    .post('/post', ctx => {
        ctx.response.body = 'this is web post page';
    })


export default web