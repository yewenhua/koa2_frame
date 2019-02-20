/**
 * Created by Administrator on 2019/2/16.
 */

const request = require("request");
const _ = require("lodash");
const API_URL = 'https://v2-api.jsdama.com/upload';

class JsDati {
    verify(imgBuffer, type = 1013, min = 4, max = 6) {
        let payload = {
            "softwareId": 10393,
            "softwareSecret": "XFPAbuItEcVBV99cvGuWp1z9UkQqTlJJzRoIV059",
            "username": "fantian",
            "password": "fantianAAA123",
            "captchaData": imgBuffer.toString('base64'),
            "captchaType": type,
            "captchaMinLength": min,
            "captchaMaxLength": max
        };
        return new Promise((resolve, reject) => {
            request({
                method: 'POST',
                url: API_URL,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            }, function (err, httpResponse, body) {
                if (err) {
                    reject(err);
                    return;
                }
                if (typeof body === 'string') {
                    try {
                        body = JSON.parse(body);
                    }
                    catch (e) {
                        reject(e);
                        return;
                    }
                }
                if (body.code !== 0) {
                    reject(body);
                    return;
                }
                resolve(_.get(body, 'data.recognition', null));
            });
        });
    }
};

exports.JsDati = JsDati;