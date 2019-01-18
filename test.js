const Koa = require('koa');
const koaStatic = require('koa-static');
const convert = require('koa-convert');
const path = require('path');
const app = new Koa();

const staticFun = convert(koaStatic(path.join(__dirname, 'static')));
app.use(staticFun);

app.use(async ctx => {
    ctx.body = 'Hello World';
});

app.listen(3000);