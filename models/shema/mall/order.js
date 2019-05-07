import Sequelize from 'sequelize';
import { db_mall } from '../../db'

const Order = db_mall.define('orders', {
    orderid: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('orderid', val);
        },
        get() {
            const val = this.getDataValue('orderid');
            return val;
        }
    },
    address_id: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('address_id', val);
        },
        get() {
            const val = this.getDataValue('address_id');
            return val;
        }
    },
    money: {
        type: Sequelize.DECIMAL(10, 2),
        set(val) {
            this.setDataValue('money', val);
        },
        get() {
            const val = this.getDataValue('money');
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
    pay_no: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('pay_no', val);
        },
        get() {
            const val = this.getDataValue('pay_no');
            return val;
        }
    },
    pay_time: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
        set(val) {
            this.setDataValue('pay_time', val);
        },
        get() {
            const val = this.getDataValue('pay_time');
            return val;
        }
    },
    cash_status: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('cash_status', val);
        },
        get() {
            const val = this.getDataValue('cash_status');
            return val;
        }
    },
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

const OrderGoods = db_mall.define('order_goods', {
    order_id: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('order_id', val);
        },
        get() {
            const val = this.getDataValue('order_id');
            return val;
        }
    },
    goods_id: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('goods_id', val);
        },
        get() {
            const val = this.getDataValue('goods_id');
            return val;
        }
    },
    num: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('num', val);
        },
        get() {
            const val = this.getDataValue('num');
            return val;
        }
    },
    goods_price: {
        type: Sequelize.DECIMAL(10, 2),
        set(val) {
            this.setDataValue('goods_price', val);
        },
        get() {
            const val = this.getDataValue('goods_price');
            return val;
        }
    },
    goods_img: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('goods_img', val);
        },
        get() {
            const val = this.getDataValue('goods_img');
            return val;
        }
    },
    goods_name: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('goods_name', val);
        },
        get() {
            const val = this.getDataValue('goods_name');
            return val;
        }
    },
    goods_sku: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('goods_sku', val);
        },
        get() {
            const val = this.getDataValue('goods_sku');
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

const OrderProcess  = db_mall.define('order_process', {
    order_id: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('order_id', val);
        },
        get() {
            const val = this.getDataValue('order_id');
            return val;
        }
    },
    status: {
        type: Sequelize.STRING,
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
Order.sync({ force: false });
OrderGoods.sync({ force: false });
OrderProcess.sync({ force: false });

Order.hasMany(OrderGoods, {foreignKey: 'order_id', sourceKey:'id', as: 'Goods'});
OrderGoods.belongsTo(Order, {foreignKey: 'order_id', targetKey:'id'});

Order.hasMany(OrderProcess, {foreignKey: 'order_id', sourceKey:'id', as: 'Processes'});
OrderProcess.belongsTo(Order, {foreignKey: 'order_id', targetKey:'id'});

module.exports = {
    Order,
    OrderGoods,
    OrderProcess
}