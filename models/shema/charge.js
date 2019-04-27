import Sequelize from 'sequelize';
import { db } from '../db'

const Table = db.define('chargelog', {
    pwd_id: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('pwd_id', val);
        },
        get() {
            const val = this.getDataValue('pwd_id');
            return val;
        }
    },
    password: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('password', val);
        },
        get() {
            const val = this.getDataValue('password');
            return val;
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
    deletedAt: {
        type: Sequelize.DATE, // 指定值的类型
        field: 'deleted_at', // 指定存储在表中的键名称
        allowNull: true
    }
}, {
    // 如果为 true 则表的名称和 model 相同，即 user
    // 为 false MySQL创建的表名称会是复数 users
    // 如果指定的表名称本就是复数形式则不变
    freezeTableName: true
});

// 创建表
// sync() 会创建表并且返回一个Promise对象
// 如果 force = true 则会把存在的表（如果表已存在）先销毁再创建表
// 默认情况下 forse = false
Table.sync({ force: false });

module.exports = Table