import Model from  '../shema/mall/miniuser';

class AddressModel {

    // 通过 ID 查找文章
    static async findById(id) {
        return await Model.Address.findById(id);
    };

    static async findByDetail(params) {
        return await Model.Address.findOne({
            where: params
        });
    };

    static async findLatest(mini_id) {
        return await Model.Address.findOne({
            where: {
                mini_id
            },
            order: [['id', 'DESC']]
        });
    };

    static async insertOne (params) {
        return await Model.Address.create(params);
    }
}

export default AddressModel;