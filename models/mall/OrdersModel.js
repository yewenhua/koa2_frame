import Model from  '../shema/mall/order';
import GoodsModel from '../mall/GoodsModel';
import { db_mall } from '../db';
import * as constants from '../Constants.js'

class OrdersModel {

    // 通过 ID 查找文章
    static async findById(id) {
        return await Model.Order.findById(id);
    };

    static async insertOne (goods, money, orderid, address_id, mini_id) {
        return await db_mall.transaction(async (t)=>{
            let order =  await Model.Order.create({
                orderid: orderid,
                address_id: address_id,
                mini_id: mini_id,
                money: money,
                pay_no: '',
                pay_time: null,
            }, {transaction: t});

            let process =  await Model.OrderProcess.create({
                order_id: order.id,
                status: constants.PROCESS_CREATE
            }, {transaction: t});

            let flag = false;
            let total = 0;
            for(let i=0; i<goods.length; i++){
                let row = await GoodsModel.findById(goods[i].goods_id);
                if(row){
                    total = total + row.sale_price * goods[i].num;
                }
                else{
                    throw new Error();
                }

                let params = {
                    goods_id: goods[i].goods_id,
                    order_id: order.id,
                    num: goods[i].num,
                    goods_price: row ? row.sale_price : 0,
                    goods_img: goods[i].face,
                    goods_name: row ? row.name : '',
                    goods_sku: goods[i].selectedProperties.attr_id,
                    status: constants.ORDER_NOPAY,
                    cash_status: constants.CASH_NOCHECK,
                };
                let orderGood = await Model.OrderGoods.create(params, {transaction: t});
                if(!orderGood){
                    flag = true;
                }
            }

            if(!order || !process || flag || total != money){
                //回滚
                throw new Error();
            }
            return order;
        });
    };

    static async findByPage (offset, num, searchKey) {
        // 向 image 表中插入数据
        let where = {};
        if(searchKey){
            let like = '%' + searchKey + '%';
            where.name = {
                [Op.like]: like
            }
        }
        return await Model.Order.findAndCountAll({
            where: where,
            offset: offset,
            limit: num
        });
    };
}

export default OrdersModel;