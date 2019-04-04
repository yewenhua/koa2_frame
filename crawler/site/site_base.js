/**
 * Created by Administrator on 2019/2/15.
 */

const lodash = require("lodash");
const puppeteer = require("puppeteer-core");
const site = require("../../config/site");
//const { CaptchaQQ } = require("../../services/CaptchaQQ");

class SiteBase {
    constructor(task) {
        this.defaultUserAgent = 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36';
        this._cookies = [];
        this.task = task;
    }

    get page() {
        return this._page;
    }

    get browser() {
        return this._browser;
    }

    get cookies() {
        return this._cookies || [];
    }

    set cookies(cookies) {
        this._cookies = cookies;
    }

    get material() {
        return this.task.material;
    }

    get title() {
        return this._title;
    }

    set title(title) {
        this._title = title;
    }

    async init() {
        this._browser = await puppeteer.launch({
            headless: false
        });
        this._page = (await this.browser.pages())[0];

        this._page.on('dialog', async (dialog) => {
            console.log('拦截弹窗，type=%s, message=%s', dialog.type(), dialog.message());
            await dialog.dismiss();
        });

        await this.page.setUserAgent(this.defaultUserAgent);
        let cookies = this._cookies;
        if (cookies.length === 0) {
            console.log('没有 cookies');
        }
        else {
            if (this.task.site.slug === site.SLUG_58PIC) {
                cookies = lodash.filter(cookies, v => {
                    return v.name.toLowerCase().indexOf('risk') < 0;
                });
            }
            await this.page.setCookie(...cookies);
        }
        await this.openUrl();
    }

    async newPage() {
        const page = await this.browser.newPage();
        await page.setUserAgent(this.defaultUserAgent);
        return page;
    }

    async getAllCookies() {
        let page = this.page;
        if (page.isClosed()) {
            return this.cookies;
        }
        let ret = await page._client.send('Network.getAllCookies');
        return ret.cookies;
    }

    async openUrl() {
        await this.page.goto('http://www.58pic.com/newpic/33512793.html', {
            waitUntil: 'networkidle2'
        });
    }

    async isLogin() {
        return false;
    }

    async beforeLogin() {

    }

    async afterLogin() {

    }

    async openLoginPage(page) {

    }

    isQQLoginCallback(res) {

    }

    qqQuickLoginHandler(req) {
        if (/^https?:\/\/localhost\.ptlogin2\.qq\.com:\d+\/pt_get_uins\?/.test(req.url())) {
            console.log('禁止qq快速登陆，加快登陆时间');
            req.abort().catch(() => {

            });
        }
        else {
            req.continue().catch(() => {

            });
        }
    }

    reload() {
        return this.page.reload({
            waitUntil: 'networkidle2'
        });
    }

    async qqLogin(page) {
        console.log(`开始输入QQ账号密码`);
        let frame = null;
        for (const f of page.frames()) {
            if (f.name() === 'ptlogin_iframe') {
                frame = f;
                break;
            }
        }

        if (frame === null) {
            console.log('没有获取到QQ登陆的 frame. ', page.url());
            return;
        }

        if (!await frame.waitForSelector('#login_button').catch(e => {
                console.log(e);
            })) {
            return;
        }
        console.log('delay 500');
        await frame.waitFor(500);
        await frame.waitForSelector('#switcher_plogin', {
            timeout: 5000
        });
        await frame
            .click('#switcher_plogin', {
                delay: SiteBase.clickDelay()
            })
            .catch(e => {
                console.log('没有看见 #switcher_plogin 元素。', e);
            });

        const qq = this.task.account.account;
        const pwd = this.task.account.password;
        if (!qq || !pwd) {
            console.log(`账号或者密码为空`);
        }
        console.log(`输入账号：${qq}`);
        await frame.evaluate(() => {
            // @ts-ignore
            document.querySelector('#u').value = '';
            // @ts-ignore
            document.querySelector('#p').value = '';
        });

        await frame.type('#u', qq, {
            delay: SiteBase.typeDelay()
        });
        await page.waitFor(200);
        console.log('输入密码：****');
        await frame.focus('#p');
        await frame.type('#p', pwd, {
            delay: SiteBase.typeDelay()
        });

        this.qqLoginCaptchaHandler(page, frame).then(() => {
            console.log('验证码逻辑执行完毕');
        }).catch(e => {
            console.log('验证码逻辑异常', e);
        });

        page.off('request', this.qqQuickLoginHandler);
        // 关闭所有拦截
        await page.setRequestInterception(false);
        console.log('提交登录请求');
        await frame.click('#login_button', {
            delay: SiteBase.clickDelay()
        });

        const resp = await page.waitForResponse(res => {
            return this.isQQLoginCallback(res);
        }, {
            timeout: 10000
        }).catch(async (e) => {
            console.log('等待QQ登陆回调超时 ', e);
            await page.screenshot({
                path: 'timeout.png',
                fullPage: true
            });
        });
        if (resp) {
            console.log('拦截到 QQ 登陆回调，cb=', resp.url());
        }
        if (!page.isClosed()) {
            page.close().catch(() => {
            });
        }
        await this.reload();
    }

    async qqLoginCaptchaHandler(page, frame, retries = 3) {
        if (retries <= 0) {
            console.log('QQ 验证码多次错误');
            return;
        }
        retries--;
        const captchaResponse = await Promise.all([
            page.waitForResponse(function (req) {
                return req.url().startsWith('https://hy.captcha.qq.com/hycdn_1');
            }, {
                timeout: 60000
            }),
            page.waitForResponse(function (req) {
                return req.url().startsWith('https://hy.captcha.qq.com/hycdn_2');
            }, {
                timeout: 60000
            })
        ]).then((resp) => {
            const captcha = [];
            captcha[0] = resp[0].url().startsWith('https://hy.captcha.qq.com/hycdn_1') ? resp[0] : resp[1];
            captcha[1] = resp[1].url().startsWith('https://hy.captcha.qq.com/hycdn_1') ? resp[0] : resp[1];
            return captcha;
        }).catch(e => {
            if (lodash.toString(e).toLowerCase().indexOf('timeout') < 0) {
                console.log('QQ 验证码获取错误。', e);
            }
        });

        if (!captchaResponse) {
            console.log('没有拦截到验证码，可能无需验证码');
            return;
        }

        const captchaFrame = frame.childFrames()[0];
        // 获取偏移值
        const offset = await page.evaluate(() => {
            const f = document.querySelector('#ptlogin_iframe');
            const offset = {};
            // @ts-ignore
            offset.x = f.offsetLeft + f.clientLeft;
            // @ts-ignore
            offset.y = f.offsetTop + f.clientTop;
            return offset;
        });
        offset.x += 80;
        offset.y += 240;
        console.log(`滑块按钮位置 x=${offset.x}, y=${offset.y}`);
        console.log('开始获取验证码图片');
        console.log('获取到验证码图片，长度：', captchaResponse.length);
        if (captchaResponse.length === 2) {
            console.log('开始获取验证码坐标');
            const target = 0;
            //const target = CaptchaQQ.analyze(await captchaResponse[0].buffer(), await captchaResponse[1].buffer(), true);
            console.log('获取到坐标: ', target);
            console.log('准备移动滑块');
            await new Promise(r => {
                setTimeout(() => {
                    r();
                }, 1000);
            });
            const steps = lodash.random(130, 180);
            console.log('开始移动滑块: ' + steps);
            await page.mouse.move(offset.x, offset.y, {
                steps: steps
            });
            await page.mouse.down();
            const t = target + offset.x - 39;
            let tmpOffset = lodash.random(10, 17);

            await page.mouse.move(t + tmpOffset, lodash.random(offset.y - 5, offset.y + 5), {
                steps: lodash.random(30, 60)
            });
            await page.mouse.move(t, lodash.random(offset.y - 5, offset.y + 5), {
                steps: lodash.random(110, 160)
            });
            page.mouse.up().catch('err');
            console.log('打码结束');
            const response = await page.waitForResponse((res) => {
                console.log(res.url());
                return res.url().startsWith('https://ssl.captcha.qq.com/cap_union_new_verify');
            }, {
                timeout: 6000
            }).catch((e) => {
                console.log('拦截验证码识别错误', e);
            });
            if (response) {
                try {
                    const json = await response.json();
                    if (json.errorCode == '0') {
                        console.log('验证码识别成功');
                        return;
                    }
                    captchaFrame.click('#e_reload').catch('err');
                }
                catch (e) {
                    console.log('解析 json 错误', e);
                }
            }
            else {
                console.log('没有获取到 https://ssl.captcha.qq.com/cap_union_new_verify');
            }
        }
        else {
            console.log('验证码图片获取异常，长度为', captchaResponse.length);
        }
        await this.qqLoginCaptchaHandler(page, frame, retries);
    }

    async sinaLogin(page) {
        console.log(`开始输入Sina账号密码`);
        await page.waitForSelector('.WB_btn_login').catch((e) => {
            console.log('页面加载错误。', e);
        });
        await page.click('#userId');
        await page.evaluate(() => {
            // @ts-ignore
            document.querySelector('#userId').value = '';
        });
        await page.type('#userId', this.task.account.username, {
            delay: SiteBase.clickDelay()
        });
        await page.focus('#passwd');
        await page.evaluate(() => {
            // @ts-ignore
            document.querySelector('#passwd').value = '';
        });
        await page.type('#passwd', this.task.account.password, {
            delay: SiteBase.clickDelay()
        });
        let isVerify = await page.evaluate(() => {
            // @ts-ignore
            return document.querySelector('.oauth_code').style.display !== 'none';
        });
        if (isVerify) {
            await page.click('.WB_text2');
            console.log('需要验证码');
            let _retries = 3;
            while (_retries-- > 0) {
                let verifyCodeResponse;
                await page.click('.WB_text2');
                try {
                    verifyCodeResponse = await page.waitForResponse((request) => {
                        return /^https?:\/\/login\.sina\.com\.cn\/cgi\/pin\.php\?.+$/.test(request.url());
                    }, {
                        timeout: 6000
                    });
                }
                catch (e) {
                    console.log('验证码图片获取错误: ', e);
                    verifyCodeResponse = null;
                    await page.click('.WB_text2');
                    continue;
                }
                console.log('开始识别验证码');
                let verifyCode = await jsdati.verify(await verifyCodeResponse.buffer(), 1038, 2, 6);
                if (!verifyCode) {
                    console.log('没有识别出来验证码');
                    verifyCodeResponse = null;
                    await page.click('.WB_text2');
                    continue;
                }
                console.log('识别出验证码：', verifyCode);
                await page.evaluate(() => {
                    // @ts-ignore
                    document.querySelector('.oauth_form_code').value = '';
                });
                await page.focus('.oauth_form_code');
                await page.type('.oauth_form_code', verifyCode, {
                    delay: SiteBase.typeDelay()
                });
                break;
            }
        }
        await page.waitFor(1000);
        await page.click('.WB_btn_login');
        const response = await page.waitForResponse(res => {
            return /^https?:\/\/login\.sina\.com\.cn\/sso\/login\.php\?/.test(res.url());
        }, {
            timeout: 6000
        }).catch(e => {
            console.log('sina 拦截登陆请求错误。', e);
        });
        if (response) {
            const json = await response.json().catch(() => {
                }) || {};
            console.log('sina response url=：', response.url());
            if (json.retcode !== 0) {
                console.log('sina 登陆失败');
            }
            else {
                await page.waitForResponse(res => {
                    return this.isQQLoginCallback(res);
                }, {
                    timeout: 8000
                }).catch(e => {
                    console.log(e);
                });
            }
        }
        if (!page.isClosed()) {
            page.close().catch(() => {
            });
        }
        await this.page.reload({
            waitUntil: 'networkidle2'
        });
    }

    async login(retries = 3, force = false) {
        //检查是否已登录
        if (await this.isLogin()) {
            if (force) {
                console.log('强制重新登陆');
            }
            else {
                console.log('已登陆..');
                return;
            }
        }
        else {
            console.log('未登陆，或者登陆已经过期');
        }

        let page;
        retries = retries > 0 ? retries : 3;
        while (true) {
            retries--;
            page = await this.openLoginPage(page);
            let ret;
            switch (this.task.account.type) {
                case 'qq':
                    ret = await this.qqLogin(page);
                    break;
                case 'sina':
                    ret = await this.sinaLogin(page);
                    break;
                default:
                    console.log(`暂时不支持这个账号类型 "${this.task.account.type}"`);
            }
            if (await this.isLogin()) {
                console.log(`66666666666`);
                console.log(`登陆成功`);
                this.cookies = await this.getAllCookies();
                return;
            }

            if (retries > 0) {
                console.log(`登陆失败，准备重新登陆`);
                if (page.isClosed()) {
                    page = undefined;
                }
            }
            else {
                console.log(`登陆失败`);
                break;
            }
        }
    }

    async start() {
        console.log('========start start==========');
        try {
            console.log('1、初始化puppeteer，并打开素材页面');
            await this.init();
            console.log('1、初始化puppeteer 结束');

            console.log('2、判断登录状态开始');
            await this.beforeLogin();
            await this.login();
            await this.afterLogin();
            console.log('2、判断登录状态结束');


            console.log('3、start crawler beigin');
            await this.crawler();
            console.log('3、start crawler over');
        }
        catch (e) {
            console.log('err err');
        }
        finally {
            console.log('finally finally');
        }
    }

    async crawler() {

    }

    async close() {
        console.log('准备关闭浏览器..');
        const pages = await this.browser.pages();
        const promises = [];
        for (const page of pages) {
            if (!page.isClosed()) {
                console.log('close', page.url());
                promises.push(page.close());
            }
        }
        try {
            await Promise.all(promises);
        }
        catch (e) {
            console.log('页面关闭错误，一般情况可以忽略', e.toString());
        }
        await this.browser.close();
        console.log('浏览器已关闭');
    }

    static clickDelay() {
        return lodash.random(35, 120);
    }

    static typeDelay() {
        return lodash.random(35, 70);
    }
}

exports.SiteBase = SiteBase;
