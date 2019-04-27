import Sequelize from 'sequelize';
import { mysql,  sql_mall} from '../config/mysql';

let db = new Sequelize(mysql.database, mysql.user, mysql.password, {
    host: mysql.host, // 数据库地址
    dialect: 'mysql', // 指定连接的数据库类型
    timezone: 'Asia/Shanghai',
    pool: {
        max: 5, // 连接池中最大连接数量
        min: 0, // 连接池中最小连接数量
        idle: 10000 // 如果一个线程 10 秒钟内没有被使用过的话，那么就释放线程
    }
});

let db_mall = new Sequelize(sql_mall.database, sql_mall.user, sql_mall.password, {
    host: sql_mall.host, // 数据库地址
    dialect: 'mysql', // 指定连接的数据库类型
    timezone: 'Asia/Shanghai',
    pool: {
        max: 5, // 连接池中最大连接数量
        min: 0, // 连接池中最小连接数量
        idle: 10000 // 如果一个线程 10 秒钟内没有被使用过的话，那么就释放线程
    }
});

module.exports = {
    db,
    db_mall
}