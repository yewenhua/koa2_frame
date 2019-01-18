import Router from 'koa-router'
import UserCtrl from '../controllers/UserController'

const api = new Router({
    prefix: '/api'
})

api.get('/get', ctx => {
        ctx.response.body = 'this is api get page';
    })
    .post('/post', ctx => {
        ctx.response.body = 'this is api post page';
    })
    .get('/login', UserCtrl.login)


export default api