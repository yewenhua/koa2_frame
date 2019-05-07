import Router from 'koa-router'
import MallCtrl from '../controllers/MallController';

const mall = new Router({
    prefix: '/mall'
})

mall.post('/goodslist', MallCtrl.goodslist)
    .get('/goodsdetail', MallCtrl.goodsdetail)
    .post('/category', MallCtrl.category)
    .post('/ordercreate', MallCtrl.ordercreate)
    .post('/orderlist', MallCtrl.orderlist)
    .get('/orderdetail', MallCtrl.orderdetail)
    .get('/address', MallCtrl.address);



export default mall;