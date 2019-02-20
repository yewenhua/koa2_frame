/**
 * Created by Administrator on 2019/2/15.
 */

import { SiteBase } from './site_base';

class Site58pic extends SiteBase {
    isQQLoginCallback(res) {
        return /^https?:\/\/www\.58pic\.com\/index\.php\?/i.test(res.url());
    }

    async openLoginPage(page) {
        if (!page) {
            page = await this.newPage();
            if (this.task.account.type === 'qq') {
                await page.setRequestInterception(true);
                page.on('request', this.qqQuickLoginHandler.bind(this));
            }
        }

        if (this.task.account.type === 'qq') {
            await page.goto('http://www.58pic.com/index.php?m=login&a=snsLogin&type=qq', {
                referer: this.page.url()
            });
        }
        else if (this.task.account.type === 'sina') {
            await page.goto('http://www.58pic.com/index.php?m=login&a=snsLogin&type=sina', {
                referer: this.page.url()
            });
        }
        else {
            console.log(`暂不支持这个账号登陆`);
        }

        await page.waitForNavigation({
            waitUntil: 'networkidle2'
        });
        return page;
    }

    async crawler() {
        console.log(`开始下载了`);
    }
}

exports.Site58pic = Site58pic;
