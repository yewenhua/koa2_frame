import Router from 'koa-router'
import MallCtrl from '../controllers/MallController';

const mall = new Router({
    prefix: '/mall'
})

mall.post('/goodslist', MallCtrl.goodslist)
    .post('/category', MallCtrl.category);


export default mall;