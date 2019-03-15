import Router from 'koa-router'
import WxCtrl from '../controllers/WxController';
import MiniController from '../controllers/MiniController';

const wechat = new Router({
    prefix: '/wechat'
})

wechat
    .get('/entry', WxCtrl.check)
    .post('/entry', WxCtrl.run)
    .get('/token', WxCtrl.token)
    .post('/wxpay', WxCtrl.wxpay)
    .get('/notify', WxCtrl.notify)
    .get('/scanpay', WxCtrl.scanpay)
    .post('/outhurl', WxCtrl.outhurl)
    .post('/outhinfo', WxCtrl.outhinfo)
    .post('/minilogin', MiniController.minilogin)


export default wechat;