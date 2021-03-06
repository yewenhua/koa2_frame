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
        //循环执行站点爬虫
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

                    //没有任务，暂停一秒
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

                //开启子进程执行具体任务ID
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
        //执行站点下具体的某个人物id
        task.startById(id).then(() => {
            process.exit(0);
        });
    }
    else {
        process.exit(1);
    }
}
