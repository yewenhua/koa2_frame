import Sequelize from 'sequelize';
import db from '../db'

const User = db.define('user', {
    userName: {
        type: Sequelize.STRING, // 指定值的类型
        field: 'name', // 指定存储在表中的键名称
        set(val) {
            this.setDataValue('userName', val.toUpperCase());
        },
        get() {
            const name = this.getDataValue('userName');
            // 'this' 允许你访问实例的属性
            return 'HELLO: ' + ' (' + name + ')';
        }
    },
    // 没有指定 field，表中键名称则与对象键名相同，为 email
    email: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('type', val.toUpperCase());
        },
        get() {
            const type = this.getDataValue('type');
            // 'this' 允许你访问实例的属性
            return 'KITTY: ' + ' (' + type + ')';
        }
    },
    createdAt: {
        type: Sequelize.DATE, // 指定值的类型
        field: 'created_at', // 指定存储在表中的键名称
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE, // 指定值的类型
        field: 'updated_at', // 指定存储在表中的键名称
        defaultValue: Sequelize.NOW
    },
}, {
    // 如果为 true 则表的名称和 model 相同，即 user
    // 为 false MySQL创建的表名称会是复数 users
    // 如果指定的表名称本就是复数形式则不变
    freezeTableName: false
});

// 创建表
// User.sync() 会创建表并且返回一个Promise对象
// 如果 force = true 则会把存在的表（如果users表已存在）先销毁再创建表
// 默认情况下 forse = false
 User.sync({ force: false });

module.exports = User