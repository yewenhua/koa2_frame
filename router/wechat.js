import Router from 'koa-router'
import WxCtrl from '../controllers/WxController'

const wechat = new Router({
    prefix: '/wechat'
})

wechat
    .get('/entry', WxCtrl.check)
    .post('/entry', WxCtrl.run)


export default wechat