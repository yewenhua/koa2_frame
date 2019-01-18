import Router from 'koa-router'

const admin = new Router({
    prefix: '/admin'
})

admin.get('/get', ctx => {
        ctx.response.body = 'this is admin get page';
    })
    .post('/post', ctx => {
        ctx.response.body = 'this is admin post page';
    })


export default admin