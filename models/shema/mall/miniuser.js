import Sequelize from 'sequelize';
import { db_mall } from '../../db'

const Miniuser = db_mall.define('miniuser', {
    openid: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('openid', val);
        },
        get() {
            const val = this.getDataValue('openid');
            return val;
        }
    },
    nickname: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('nickname', val);
        },
        get() {
            const val = this.getDataValue('nickname');
            return val;
        }
    },
    avatarurl: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('avatarurl', val);
        },
        get() {
            const val = this.getDataValue('avatarurl');
            return val;
        }
    },
    gender: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('gender', val);
        },
        get() {
            const val = this.getDataValue('gender');
            return val;
        }
    },
    city: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('city', val);
        },
        get() {
            const val = this.getDataValue('city');
            return val;
        }
    },
    province: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('province', val);
        },
        get() {
            const val = this.getDataValue('province');
            return val;
        }
    },
    country: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('country', val);
        },
        get() {
            const val = this.getDataValue('country');
            return val;
        }
    },
    code: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('code', val);
        },
        get() {
            const val = this.getDataValue('code');
            return val;
        }
    },
    parent_key: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('parent_key', val);
        },
        get() {
            const val = this.getDataValue('parent_key');
            return val;
        }
    },
    router: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('router', val);
        },
        get() {
            const val = this.getDataValue('router');
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

const Address = db_mall.define('address', {
    mini_id: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('mini_id', val);
        },
        get() {
            const val = this.getDataValue('mini_id');
            return val;
        }
    },
    userName: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('userName', val);
        },
        get() {
            const val = this.getDataValue('userName');
            return val;
        }
    },
    postalCode: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('postalCode', val);
        },
        get() {
            const val = this.getDataValue('postalCode');
            return val;
        }
    },
    provinceName: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('provinceName', val);
        },
        get() {
            const val = this.getDataValue('provinceName');
            return val;
        }
    },
    cityName: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('cityName', val);
        },
        get() {
            const val = this.getDataValue('cityName');
            return val;
        }
    },
    countyName: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('countyName', val);
        },
        get() {
            const val = this.getDataValue('countyName');
            return val;
        }
    },
    detailInfo: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('detailInfo', val);
        },
        get() {
            const val = this.getDataValue('detailInfo');
            return val;
        }
    },
    nationalCode: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('nationalCode', val);
        },
        get() {
            const val = this.getDataValue('nationalCode');
            return val;
        }
    },
    telNumber: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('telNumber', val);
        },
        get() {
            const val = this.getDataValue('telNumber');
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
Miniuser.sync({ force: false });
Address.sync({ force: false });

Miniuser.hasMany(Address, {foreignKey: 'mini_id', sourceKey:'id'});
Address.belongsTo(Miniuser, {foreignKey: 'mini_id',targetKey:'id'});

module.exports = {
    Miniuser,
    Address
}