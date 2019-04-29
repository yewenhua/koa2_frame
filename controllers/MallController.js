import BaseController from './BaseController';
import GoodsModel from '../models/mall/GoodsModel';
import CategoryModel from '../models/mall/CategoryModel';

class MallController extends BaseController{
    static async goodslist(ctx){
        ctx.body = ctx.request.body;
        let {searchKey, page, num} = ctx.body;
        num = 10;
        let offset = (page - 1) * num;
        let datalist = await GoodsModel.findByPage(offset, num, searchKey);
        if(datalist){
            for(let i=0; i<datalist.rows.length; i++){
                let good = datalist.rows[i];
                let images = await good.getImages();
                datalist.rows[i].images = images;
                let skus = await good.getSkus();
                datalist.rows[i].skus = skus;

                for(let j=0; j<skus.length; j++) {
                    let sku = skus[j];
                    let firstProperty = await sku.getFirstProperty();
                    let secondProperty = await sku.getSecondProperty();
                    datalist.rows[i].skus[j].firstProperty = firstProperty;
                    datalist.rows[i].skus[j].secondProperty = secondProperty;
                }
            }

            console.log('==========');
            console.log(datalist)
        }

        return ctx.success({
            msg: '操作成功',
            data: datalist
        });
    }

    static async goodsdetail(ctx){
        let { id } = ctx.query;
        if(id) {
            let good = await GoodsModel.findById(id);
            if (good) {
                let images = await good.getImages();
                good.images = images;
                let skus = await good.getSkus();
                good.skus = skus;

                for (let j = 0; j < skus.length; j++) {
                    let sku = skus[j];
                    let firstProperty = await sku.getFirstProperty();
                    let secondProperty = await sku.getSecondProperty();
                    good.skus[j].firstProperty = firstProperty;
                    good.skus[j].secondProperty = secondProperty;
                }

                console.log('==========');
                console.log(good)
                return ctx.success({
                    msg: '操作成功',
                    data: good
                });
            }
            else{
                return ctx.error({
                    code: 10002,
                    msg: '数据不存在',
                    data: null
                });
            }
        }
        else{
            return ctx.error({
                code: 10001,
                msg: '参数缺失',
                data: null
            });
        }
    }

    static async category(ctx){
        ctx.body = ctx.request.body;
        let { num, searchKey } = ctx.body;
        num = 10;
        let datalist = await CategoryModel.findLevelTwoOpen();
        if(datalist){
            for(let i=0; i<datalist.length; i++){
                let path = datalist[i].path;
                let pathGoods = await GoodsModel.findByPath (path, num, searchKey);
                if(pathGoods && pathGoods.length > 0){
                    for(let j=0; j<pathGoods.length; j++){
                        let images = await pathGoods[j].getImages();
                        pathGoods[j].dataValues.images = images;
                        let face = '';
                        if(images && images.length > 0){
                            for(let k=0; k<images.length; k++){
                                if(images[k].type == 'main'){
                                    face = images[k].url;
                                    break;
                                }
                            }
                        }
                        pathGoods[j].dataValues.face = face;
                    }
                }
                datalist[i].dataValues.goodslist = pathGoods;
            }


            console.log('==========');
            console.log(datalist)
        }

        return ctx.success({
            msg: '操作成功',
            data: datalist
        });
    }
}

export default MallController;