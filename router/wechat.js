import Router from 'koa-router'
import WxCtrl from '../controllers/WxController';
import MiniController from '../controllers/MiniController';

const wechat = new Router({
    prefix: '/wechat'
})

wechat
    .get('/entry', WxCtrl.check)
    .post('/entry', WxCtrl.run)
    .get('/menu', WxCtrl.menu)
    .post('/jssdk', WxCtrl.jssdk)
    .post('/wxpay', WxCtrl.wxpay)
    .post('/notify', WxCtrl.notify)
    .post('/scanpayurl', WxCtrl.scanpayurl)
    .post('/scanpaycb', WxCtrl.scanpaycb)
    .post('/outhurl', WxCtrl.outhurl)
    .post('/outhinfo', WxCtrl.outhinfo)
    .post('/minilogin', MiniController.minilogin)
    .get('/service', WxCtrl.service)


export default wechat;