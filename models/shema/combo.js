import Sequelize from 'sequelize';
import db from '../db'

const Table = db.define('combo', {
    name: {
        type: Sequelize.STRING, // 指定值的类型
        field: 'name', // 指定存储在表中的键名称
        set(val) {
            this.setDataValue('name', val);
        },
        get() {
            const val = this.getDataValue('name');
            return val;
        }
    },
    price: {
        type: Sequelize.STRING, // 指定值的类型
        set(val) {
            this.setDataValue('price', val);
        },
        get() {
            const val = this.getDataValue('price');
            return val;
        }
    },
    type: {
        type: Sequelize.STRING, // 指定值的类型
        field: 'type', // 指定存储在表中的键名称
        set(val) {
            this.setDataValue('type', val);
        },
        get() {
            const val = this.getDataValue('type');
            return val;
        }
    },
    timelong: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('timelong', val);
        },
        get() {
            const val = this.getDataValue('timelong');
            return val;
        }
    },
    count: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('count', val);
        },
        get() {
            const val = this.getDataValue('count');
            return val;
        }
    },
    point: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('point', val);
        },
        get() {
            const val = this.getDataValue('point');
            return val;
        }
    },
    isopen: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('isopen', val);
        },
        get() {
            const val = this.getDataValue('isopen');
            return val;
        }
    },
    is_private: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('is_private', val);
        },
        get() {
            const val = this.getDataValue('is_private');
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