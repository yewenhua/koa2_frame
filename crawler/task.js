/**
 * Created by Administrator on 2019/2/15.
 */

const { Site58pic } = require("../crawler/site/site_58pic");

async function startById(id) {
    //查找素材  包括素材所在的网站  服务器  账号等信息

    //找到相应的网站爬虫


    //启动爬虫
    let task = {
        account: {
            type: 'qq',
            account: '2574522520',
            password: '624500929wenhua'
        }
    };
    const crawler = new Site58pic(task);
    await crawler.start();
}

exports.startById = startById;