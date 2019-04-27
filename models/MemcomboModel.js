import Memcombo from  './shema/memcombo';

class MemcomboModel {
    // 通过pwdid查找
    static async findByPwdId (pwd_id) {
        return await Memcombo.findOne({where: {pwd_id: pwd_id}});
    };

    // 通过siteid查找
    static async findBySiteId (site_id) {
        return await Memcombo.findOne({where: {site_id: site_id}});
    };

    // 通过 ID 查找文章
    static async findById(id) {
        return await Memcombo.findById(id);
    };
}

export default MemcomboModel;