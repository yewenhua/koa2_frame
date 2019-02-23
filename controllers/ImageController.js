import jwt from 'jsonwebtoken';
import ImageModel from '../models/ImageModel'
import BaseController from './BaseController'
import request from 'superagent';
const logUtil = require('../utils/LogUtil');

/*
 * ImageController
 * 静态方法并不需要实例化就可以访问 使用static，你不需要new，你可以减少内存的损耗
 */

class ImageController extends BaseController{

    // 转换
    static async transfer(ctx) {
        //ctx.request.body 用于获取post的参数
        ctx.body = ctx.request.body;
        let title = ctx.body.title;
        let pics = ctx.body.pic;
        let pic_arr = [];
        for(let i=0; i<pics.length; i++){
            pic_arr.push(process.env.DOMAIN + '/upload/' + pics[i].name);
        }
        console.log('=========================');
        console.log(pic_arr);

        let url = "https://ocrapi-ecommerce.taobao.com/ocrservice/ecommerce";
        let appcode = "0172b53613af48ebbf0fd99fcda79342";
        let auth = 'APPCODE ' + appcode;
        let res = [];
        for(let i=0; i<pic_arr.length; i++) {
            let sendData = {
                url: pic_arr[i],
                prob: false
            }

            let rtnData = await request.post(url)
                .set('Authorization', auth)
                .set('Content-Type', 'application/json')
                .send(sendData);

            let format = {};
            if (rtnData.status == 200 && rtnData.text) {
                let rtn = JSON.parse(rtnData.text);
                if (rtn.prism_wnum && rtn.prism_wordsInfo && rtn.prism_wordsInfo.length > 0) {
                    let back = [];
                    for (let i = 0; i < rtn.prism_wordsInfo.length; i++) {
                        back.push(rtn.prism_wordsInfo[i].word);
                    }
                    format = {
                        prism_wnum: rtn.prism_wnum,
                        prism_wordsInfo: back
                    };

                    res.push(format);
                }
            }
        }

        if(res.length > 0){
            return ctx.success({
                msg: '转换成功',
                data: res
            });
        }
        else {
            return ctx.success({
                code: 10001,
                msg: '转换失败',
                data: res
            });
        }
    }

    // 上传文件
    static async upload(ctx) {
        const file = ctx.request.files.file; // 获取上传文件
        return ctx.success({
            msg:'上传成功',
            data: {
                path: file.path
            }
        });
    }
}

export default ImageController;