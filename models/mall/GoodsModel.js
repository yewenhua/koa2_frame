import Model from  '../shema/mall/goods';
import Category from  '../shema/mall/category';
import Sequelize from 'sequelize';

const Op = Sequelize.Op;
class GoodsModel {

    // 通过 ID 查找文章
    static async findById(id) {
        return await Model.Goods.findById(id);
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
        return await Model.Goods.findAndCountAll({
            where: where,
            offset: offset,
            limit: num
        });
    };

    static async findByPath (path, num, searchKey) {
        // 向 image 表中插入数据
        let where = {
            category: {
                [Op.like]: path + '%'
            }
        };
        if(searchKey){
            let like = '%' + searchKey + '%';
            where.name = {
                [Op.like]: like
            }
        }
        return await Model.Goods.findAll({
            where: where,
            offset: 0,
            limit: num
        });
    };
}

export default GoodsModel;