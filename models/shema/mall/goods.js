import Sequelize from 'sequelize';
import { db_mall } from '../../db'

const Goods = db_mall.define('goods', {
    category: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('category', val);
        },
        get() {
            const val = this.getDataValue('category');
            return val;
        }
    },
    name: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('name', val);
        },
        get() {
            const val = this.getDataValue('name');
            return val;
        }
    },
    sale_price: {
        type: Sequelize.DECIMAL(10, 2),
        set(val) {
            this.setDataValue('sale_price', val);
        },
        get() {
            const val = this.getDataValue('sale_price');
            return val;
        }
    },
    market_price: {
        type: Sequelize.DECIMAL(10, 2),
        set(val) {
            this.setDataValue('market_price', val);
        },
        get() {
            const val = this.getDataValue('market_price');
            return val;
        }
    },
    discount: {
        type: Sequelize.DECIMAL(6, 1),
        set(val) {
            this.setDataValue('discount', val);
        },
        get() {
            const val = this.getDataValue('discount');
            return val;
        }
    },
    remain_num: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('remain_num', val);
        },
        get() {
            const val = this.getDataValue('remain_num');
            return val;
        }
    },
    sale_num: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('sale_num', val);
        },
        get() {
            const val = this.getDataValue('sale_num');
            return val;
        }
    },
    is_release: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('is_release', val);
        },
        get() {
            const val = this.getDataValue('is_release');
            return val;
        }
    },
    is_recommend: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('is_recommend', val);
        },
        get() {
            const val = this.getDataValue('is_recommend');
            return val;
        }
    },
    is_time_buy: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('is_time_buy', val);
        },
        get() {
            const val = this.getDataValue('is_time_buy');
            return val;
        }
    },
    time_buy_time: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
        set(val) {
            this.setDataValue('time_buy_time', val);
        },
        get() {
            const val = this.getDataValue('time_buy_time');
            return val;
        }
    },
    weight: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('weight', val);
        },
        get() {
            const val = this.getDataValue('weight');
            return val;
        }
    },
    limit_buy_num: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('limit_buy_num', val);
        },
        get() {
            const val = this.getDataValue('limit_buy_num');
            return val;
        }
    },
    send_method: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('send_method', val);
        },
        get() {
            const val = this.getDataValue('send_method');
            return val;
        }
    },
    sort_id: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('sort_id', val);
        },
        get() {
            const val = this.getDataValue('sort_id');
            return val;
        }
    },
    merchant_id: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('merchant_id', val);
        },
        get() {
            const val = this.getDataValue('merchant_id');
            return val;
        }
    },
    is_pintuan: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('is_pintuan', val);
        },
        get() {
            const val = this.getDataValue('is_pintuan');
            return val;
        }
    },
    pintuan_num: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('pintuan_num', val);
        },
        get() {
            const val = this.getDataValue('pintuan_num');
            return val;
        }
    },
    pintuan_time: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
        set(val) {
            this.setDataValue('pintuan_time', val);
        },
        get() {
            const val = this.getDataValue('pintuan_time');
            return val;
        }
    },
    is_sku: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('is_sku', val);
        },
        get() {
            const val = this.getDataValue('is_sku');
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

const GoodsImages = db_mall.define('goods_images', {
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
    type: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('type', val);
        },
        get() {
            const val = this.getDataValue('type');
            return val;
        }
    },
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

const Sku = db_mall.define('sku', {
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
    first_properties_id: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('first_properties_id', val);
        },
        get() {
            const val = this.getDataValue('first_properties_id');
            return val;
        }
    },
    second_properties_id: {
        type: Sequelize.INTEGER,
        set(val) {
            this.setDataValue('second_properties_id', val);
        },
        get() {
            const val = this.getDataValue('second_properties_id');
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

const Properties = db_mall.define('properties', {
    title: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('title', val);
        },
        get() {
            const val = this.getDataValue('title');
            return val;
        }
    },
    name: {
        type: Sequelize.STRING,
        set(val) {
            this.setDataValue('name', val);
        },
        get() {
            const val = this.getDataValue('name');
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
Goods.sync({ force: false });
GoodsImages.sync({ force: false });
Sku.sync({ force: false });
Properties.sync({ force: false });

Goods.hasMany(GoodsImages, {foreignKey: 'goods_id',sourceKey:'id', as: 'Images'});
GoodsImages.belongsTo(Goods, {foreignKey: 'goods_id',targetKey:'id'});
Goods.hasMany(Sku, {foreignKey: 'goods_id'});
Sku.belongsTo(Goods, {foreignKey: 'goods_id'});
Sku.belongsTo(Properties, {as: 'FirstProperty', foreignKey : 'first_properties_id'});
Sku.belongsTo(Properties, {as: 'SecondProperty', foreignKey : 'second_properties_id'});

module.exports = {
    Goods,
    GoodsImages,
    Sku,
    Properties
}