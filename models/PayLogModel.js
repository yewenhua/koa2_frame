import Paylog from  './shema/paylog';

class PaylogModel {
    // 通过pwdid查找
    static async findByPwdId (pwd_id) {
        return await Paylog.findOne({where: {pwd_id: pwd_id}});
    };

    // 通过 ID 查找文章
    static async findById(id) {
        return await Paylog.findById(id);
    };
}

export default PaylogModel;