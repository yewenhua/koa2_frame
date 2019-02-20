module.exports = {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    port: process.env.REDIS_PORT || '6379',
    host: process.env.REDIS_HOST || '127.0.0.1'
}
