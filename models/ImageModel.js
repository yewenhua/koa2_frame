import Image from  './shema/images'

class ImageModel {
    // 添加新用户
    static async addImage (name, status) {
        // 向 image 表中插入数据
        return await Image.create({
            name: name,
            status: status
        });
    };

    // 通过名称查找
    static async findByName (name) {
        return await Image.findOne({where: {name: name}});
    };

    // 通过 ID 查找
    static async findById(id) {
        return await Image.findById(id);
    };
}

export default ImageModel;