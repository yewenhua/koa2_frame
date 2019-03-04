import Sequelize from 'sequelize';
import db from '../db'

const Image = db.define('image', {
    url: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('url', val);
        },
        get() {
            const val = this.getDataValue('url');
            return val;
        }
    },
    label: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('label', val);
        },
        get() {
            const val = this.getDataValue('label');
            return val;
        }
    },
    status: {
        type: Sequelize.ENUM,
        values: ['notpay', 'payed'],
        set(val) {
            this.setDataValue('status', val);
        },
        get() {
            const val = this.getDataValue('status');
            return val;
        }
    },
    result: {
        type: Sequelize.TEXT,
        set(val) {
            this.setDataValue('result', val);
        },
        get() {
            const val = this.getDataValue('result');
            return val;
        }
    },
    pay_id: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('pay_id', val);
        },
        get() {
            const val = this.getDataValue('pay_id');
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
    // 如果为 true 则表的名称和 model 相同，即 image
    // 为 false MySQL创建的表名称会是复数 images
    // 如果指定的表名称本就是复数形式则不变
    freezeTableName: false
});

// 创建表
// Image.sync() 会创建表并且返回一个Promise对象
// 如果 force = true 则会把存在的表（如果images表已存在）先销毁再创建表
// 默认情况下 forse = false
Image.sync({ force: false });

module.exports = Image