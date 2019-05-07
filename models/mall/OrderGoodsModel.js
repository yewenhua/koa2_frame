import Model from  '../shema/mall/order';

class OrderGoodsModel {

    // 通过 ID 查找文章
    static async findById(id) {
        return await Model.OrderGoods.findById(id);
    };

}

export default OrderGoodsModel;