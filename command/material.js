/**
 * Created by Administrator on 2019/2/15.
 */

const site = require("../config/site");
const redisConf = require("../config/redis");
const path = require("path");
const child_process = require("child_process");
const IORedis = require("ioredis");
const task = require("../crawler/task");

const redisObj = new IORedis({
    port: redisConf.port,
    host: redisConf.host
});

exports.command = 'material';
exports.describe = '启动爬虫服务';
exports.builder = {
    id: {
        describe: '任务ID',
        alias: 'i',
        type: 'number'
    },
    site: {
        describe: '站点',
        alias: 's',
        choices: [
            site.SLUG_699PIC,
            site.SLUG_588KU,
            site.SLUG_IBAOTU,
            site.SLUG_NIPIC,
            site.SLUG_58PIC,
            site.SLUG_90SHEJI,
            site.SLUG_OOOPIC,
            site.SLUG_88TPH,
            site.SLUG_51YUANSU,
            site.SLUG_16PIC,
            site.SLUG_TUKUPPT,
            site.SLUG_WENKU
        ]
    }
}
exports.handler = function (argv) {
    const id = argv.id;
    const slug = argv.site;
    if (slug) {
        (async () => {
            const workip = '127.0.0.1';
            const queueKey = `material:${slug}:${workip}`;
            let isWaiting = false;

            do {
                const id = await redisObj.spop(queueKey);
                if (!id) {
                    if (!isWaiting) {
                        console.log(`wait...`);
                    }
                    await new Promise(resolve => {
                        setTimeout(() => {
                            resolve();
                        }, 1000);
                    });
                    isWaiting = true;
                    continue;
                }
                isWaiting = false;

                const cwd = path.resolve(__dirname, '..');
                let cmd = `node crawler material --id=${id}`;
                console.log('============');
                console.log(cmd);

                setTimeout(() => {
                    console.log('任务超时，强制退出');
                    redisObj
                        .sadd(queueKey, id)
                        .then(() => {
                            console.log('error code 2');
                            process.exit(2);
                        })
                        .catch(() => {
                            console.log('error code 3');
                            process.exit(3);
                        });
                }, 10 * 60 * 1000);
                child_process.execSync(cmd, {
                    cwd: cwd,
                    env: process.env,
                    stdio: [0, 1, 2]
                });
            } while (true);
            process.exit(0);
        })();
    }
    else if (id) {
        console.log('1111111111');
        task.startById(id).then(() => {
            process.exit(0);
        });
    }
    else {
        console.log('2222222222');
        process.exit(1);
    }
}
