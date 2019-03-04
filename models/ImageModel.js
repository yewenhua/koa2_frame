import Image from  './shema/images'

class ImageModel {
    // 添加
    static async addImage (url, status) {
        // 向 image 表中插入数据
        return await Image.create({
            url: url,
            status: status
        });
    };

    // 通过 ID 查找
    static async findById(id) {
        return await Image.findById(id);
    };
}

export default ImageModel;