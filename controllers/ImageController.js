import ImageModel from '../models/ImageModel';
import UserModel from '../models/UserModel';
import BaseController from './BaseController';
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
        let success = 0;

        if(pics && pics.length > 0) {
            let userInfo = await UserModel.findById(ctx.user.id);
            if(userInfo && userInfo.count >= pics.length) {
                let url = "https://ocrapi-document.taobao.com/ocrservice/document";
                let appcode = "0172b53613af48ebbf0fd99fcda79342";
                let auth = 'APPCODE ' + appcode;
                let rtn = [];
                let format = [];
                for (let i = 0; i < pics.length; i++) {
                    let pic = pics[i].url;
                    let sendData = {
                        url: pic,
                        prob: false
                    }

                    let rtnData = await request.post(url)
                        .set('Authorization', auth)
                        .set('Content-Type', 'application/json')
                        .send(sendData);

                    console.log("88888888888888");
                    //console.log(sendData);

                    if (rtnData.status == 200 && rtnData.text) {
                        let rtn = JSON.parse(rtnData.text);
                        console.log("**************");
                        //console.log(rtn);
                        //console.log("**************");
                        if (rtn.prism_wnum && rtn.prism_wordsInfo && rtn.prism_wordsInfo.length > 0) {
                            let back = [];
                            for (let i = 0; i < rtn.prism_wordsInfo.length; i++) {
                                back.push(rtn.prism_wordsInfo[i].word);
                            }

                            success++;
                            format = {
                                label: title,
                                status: 'success',
                                url: pics[i].url,
                                data: {
                                    prism_wnum: rtn.prism_wnum,
                                    prism_wordsInfo: back,
                                    original_wordInfo: rtn.prism_wordsInfo
                                }
                            }
                        }
                        else {
                            format = {
                                label: title,
                                status: 'fail',
                                url: pics[i].url,
                                data: null
                            }
                        }
                    }
                    else {
                        format = {
                            label: title,
                            status: 'fail',
                            url: pics[i].url,
                            data: null
                        }
                    }

                    rtn.push(format);
                }

                let flag = false;
                if (success > 0) {
                    console.log("555555555555");
                    let uid = ctx.user.id;
                    let payRes = await UserModel.payCountMoney(uid, success, rtn);
                    if (payRes && payRes.id) {
                        console.log("6666666666");
                        flag = true;
                    }
                }

                if (flag) {
                    console.log("7777777777777");
                    //console.log(rtn);
                    return ctx.success({
                        msg: '转换成功',
                        data: rtn
                    });
                }
                else {
                    console.log("QQQQQQQQQQQQQQQQQ");
                    return ctx.error({
                        code: 10001,
                        msg: '转换失败',
                        data: null
                    });
                }
            }
            else{
                return ctx.error({
                    code: 10008,
                    msg:'余额不足',
                    data: null
                });
            }
        }
        else{
            return ctx.error({
                code: 10009,
                msg:'参数错误',
                data: null
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

    //历史结果
    static async querylist(ctx){
        ctx.body = ctx.request.body;
        let {label, page, num} = ctx.body;
        let offset = (page - 1) * num;
        let datalist = await ImageModel.findByPage(offset, num, label);
        return ctx.success({
            msg: '操作成功',
            data: datalist
        });
    }


    // wx转换
    static async wxtrans(ctx) {
        //ctx.request.body 用于获取post的参数
        ctx.body = ctx.request.body;
        let title = 'wechat';
        let pics = ctx.body.pic;
        let success = 0;
        let uid = 10970;

        if(pics && pics.length > 0) {
            let userInfo = await UserModel.findById(uid);
            if(userInfo && userInfo.count >= pics.length) {
                let url = "https://ocrapi-ecommerce.taobao.com/ocrservice/ecommerce";
                let appcode = "0172b53613af48ebbf0fd99fcda79342";
                let auth = 'APPCODE ' + appcode;
                let rtn = [];
                let format = [];
                for (let i = 0; i < pics.length; i++) {
                    let pic = pics[i].url;
                    let sendData = {
                        url: pic,
                        prob: false
                    }

                    let rtnData = await request.post(url)
                        .set('Authorization', auth)
                        .set('Content-Type', 'application/json')
                        .send(sendData);

                    if (rtnData.status == 200 && rtnData.text) {
                        let rtn = JSON.parse(rtnData.text);
                        if (rtn.prism_wnum && rtn.prism_wordsInfo && rtn.prism_wordsInfo.length > 0) {
                            let back = [];
                            for (let i = 0; i < rtn.prism_wordsInfo.length; i++) {
                                back.push(rtn.prism_wordsInfo[i].word);
                            }

                            success++;
                            format = {
                                label: title,
                                status: 'success',
                                url: pics[i].url,
                                data: {
                                    prism_wnum: rtn.prism_wnum,
                                    prism_wordsInfo: back,
                                    original_wordInfo: rtn.prism_wordsInfo
                                }
                            }
                        }
                        else {
                            format = {
                                label: title,
                                status: 'fail',
                                url: pics[i].url,
                                data: null
                            }
                        }
                    }
                    else {
                        format = {
                            label: title,
                            status: 'fail',
                            url: pics[i].url,
                            data: null
                        }
                    }

                    rtn.push(format);
                }

                let flag = false;
                if (success > 0) {
                    let payRes = await UserModel.payCountMoney(uid, success, rtn);
                    if (payRes && payRes.id) {
                        flag = true;
                    }
                }

                if (flag) {
                    return ctx.success({
                        msg: '转换成功',
                        data: rtn
                    });
                }
                else {
                    return ctx.error({
                        code: 10001,
                        msg: '转换失败',
                        data: null
                    });
                }
            }
            else{
                return ctx.error({
                    code: 10008,
                    msg:'余额不足',
                    data: null
                });
            }
        }
        else{
            return ctx.error({
                code: 10009,
                msg:'参数错误',
                data: null
            });
        }
    }
}

export default ImageController;