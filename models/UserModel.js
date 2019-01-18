import User from  './shema/users'

class UserModel {
    // 添加新用户
    static async addUser (userName, email) {
        // 向 user 表中插入数据
        return await User.create({
            userName: userName,
            email: email
        });
    };

    // 通过用户名查找用户
    static async findByName (userName) {
        return await User.findOne({where: {name: userName}});
    };

    // 通过 ID 查找文章
    static async findById(id) {
        return await User.findById(id);
    };
}

export default UserModel;