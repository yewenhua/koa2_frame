import Sequelize from 'sequelize';
import db from '../db'

const Image = db.define('image', {
    name: {
        type: Sequelize.STRING, // 指定值的类型
        field: 'name', // 指定存储在表中的键名称
        set(val) {
            this.setDataValue('name', val);
        },
        get() {
            const name = this.getDataValue('name');
            // 'this' 允许你访问实例的属性
            return name;
        }
    },
    // 没有指定 field，表中键名称则与对象键名相同，为 status
    status: {
        type: Sequelize.ENUM,
        values: ['nouse', 'userd', 'deleted'],
        set(val) {
            this.setDataValue('status', val);
        },
        get() {
            const status = this.getDataValue('status');
            return status;
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
        defaultValue: Sequelize.NOW
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