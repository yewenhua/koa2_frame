/**
 * Created by Administrator on 2019/2/15.
 */

const site_base = require("./site_base");

class Site58pic extends site_base.SiteBase {
    isQQLoginCallback(res) {
        return /^https?:\/\/www\.58pic\.com\/index\.php\?/i.test(res.url());
    }

    async isLogin() {
        try {
            return this.page.evaluate(function () {
                // @ts-ignore
                console.log('2222222');
                console.log(isLoginStatus);
                return isLoginStatus == '1';
            });
        }
        catch (e) {
            this.log.error('isLogin error。', e);
        }
        return false;
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
                referer: this.page.url(),
                waitUntil: 'networkidle2'
            });
        }
        else if (this.task.account.type === 'sina') {
            await page.goto('http://www.58pic.com/index.php?m=login&a=snsLogin&type=sina', {
                referer: this.page.url(),
                waitUntil: 'networkidle2'
            });
        }
        else {
            console.log(`暂不支持这个账号登陆`);
        }

        return page;
    }

    async crawler() {
        console.log(`开始下载了`);
    }
}

exports.Site58pic = Site58pic;
