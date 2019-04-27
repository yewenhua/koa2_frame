
module.exports = {
    'platform': {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        database: process.env.MYSQL_DB,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PWD
    },
    'mall': {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        database: process.env.MYSQL_DB_MALL,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PWD
    }
}
