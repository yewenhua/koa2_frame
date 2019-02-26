import User from  './shema/users'

class UserModel {
    // 添加新用户
    static async addUser (password, secret) {
        // 向 user 表中插入数据
        return await User.create({
            password: password,
            secret: secret
        });
    };

    // 通过卡密查找用户
    static async findByPwd (pwd) {
        return await User.findOne({where: {password: pwd}});
    };

    // 通过 ID 查找文章
    static async findById(id) {
        return await User.findById(id);
    };

    // 通过用户名查找用户
    static async Login (password, secret) {
        return await User.findOne({where: {password: password, secret: secret}});
    };
}

export default UserModel;