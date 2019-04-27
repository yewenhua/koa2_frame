import Sequelize from 'sequelize';
import { db } from '../db'

const User = db.define('password', {
    password: {
        type: Sequelize.STRING, // 指定值的类型
        field: 'password', // 指定存储在表中的键名称
        set(val) {
            this.setDataValue('password', val);
        },
        get() {
            const password = this.getDataValue('password');
            return password;
        }
    },
    // 没有指定 field，表中键名称则与对象键名相同，为 email
    secret: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('secret', val);
        },
        get() {
            const val = this.getDataValue('secret');
            return val;
        }
    },
    uid: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('uid', val);
        },
        get() {
            const val = this.getDataValue('uid');
            return val;
        }
    },
    combo_id: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('combo_id', val);
        },
        get() {
            const val = this.getDataValue('combo_id');
            return val;
        }
    },
    mobile: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('mobile', val);
        },
        get() {
            const val = this.getDataValue('mobile');
            return val;
        }
    },
    email: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('email', val);
        },
        get() {
            const val = this.getDataValue('email');
            return val;
        }
    },
    openid: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('openid', val);
        },
        get() {
            const val = this.getDataValue('openid');
            return val;
        }
    },
    begin: {
        type: Sequelize.DATE,
        set(val) {
            this.setDataValue('begin', val);
        },
        get() {
            const val = this.getDataValue('begin');
            return val;
        }
    },
    end: {
        type: Sequelize.DATE,
        set(val) {
            this.setDataValue('end', val);
        },
        get() {
            const val = this.getDataValue('end');
            return val;
        }
    },
    active_time: {
        type: Sequelize.DATE,
        set(val) {
            this.setDataValue('active_time', val);
        },
        get() {
            const val = this.getDataValue('active_time');
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
    status: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('status', val);
        },
        get() {
            const val = this.getDataValue('status');
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
}, {
    // 如果为 true 则表的名称和 model 相同，即 user
    // 为 false MySQL创建的表名称会是复数 users
    // 如果指定的表名称本就是复数形式则不变
    freezeTableName: true
});

// 创建表
// User.sync() 会创建表并且返回一个Promise对象
// 如果 force = true 则会把存在的表（如果users表已存在）先销毁再创建表
// 默认情况下 forse = false
 User.sync({ force: false });

module.exports = User