import Charge from  './shema/charge';

class ChargeModel {
    // 通过卡密查找
    static async findByPwd (pwd) {
        return await Charge.findOne({where: {password: pwd}});
    };

    // 通过pwdid查找
    static async findByPwdId (pwd_id) {
        return await Charge.findOne({where: {pwd_id: pwd_id}});
    };

    // 通过 ID 查找文章
    static async findById(id) {
        return await Charge.findById(id);
    };
}

export default ChargeModel;