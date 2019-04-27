import Image from  './shema/images';
import Sequelize from 'sequelize';

const Op = Sequelize.Op;
class ImageModel {
    // 添加
    static async findByPage (offset, num, label) {
        // 向 image 表中插入数据
        let like = '%' + label +'%';
        return await Image.findAndCountAll({
            where: {
                label: {
                    [Op.like]: like
                }
            },
            offset: offset,
            limit: num
        });
    };

    // 通过 ID 查找
    static async findById(id) {
        return await Image.findById(id);
    };

    static async findByUrl(url) {
        return await Wechat.findOne({
            where: {
                url: url,
                status: 'payed'
            }
        });
    };
}

export default ImageModel;