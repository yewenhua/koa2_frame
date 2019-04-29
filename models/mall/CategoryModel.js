import Category from  '../shema/mall/category';

class CategoryModel {

    // 通过 ID 查找文章
    static async findById(id) {
        return await Category.findById(id);
    };

    static async findLevelTwoOpen () {
        // 向 image 表中插入数据
        let where = {
            is_open: 1,
            level: 2,
            deletedAt: null
        };

        return await Category.findAll({
            where: where,
            order: [
                ['sort', 'ASC']
            ]
        });
    };
}

export default CategoryModel;