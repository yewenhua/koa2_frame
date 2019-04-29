import Router from 'koa-router'
import MallCtrl from '../controllers/MallController';

const mall = new Router({
    prefix: '/mall'
})

mall.post('/goodslist', MallCtrl.goodslist)
    .get('/goodsdetail', MallCtrl.goodsdetail)
    .post('/category', MallCtrl.category);


export default mall;