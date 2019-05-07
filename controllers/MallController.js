import BaseController from './BaseController';
import GoodsModel from '../models/mall/GoodsModel';
import CategoryModel from '../models/mall/CategoryModel';
import AddressModel from '../models/mall/AddressModel';
import MiniuserModel from '../models/mall/MiniuserModel';
import OrdersModel from '../models/mall/OrdersModel';
import UtilsService from '../services/UtilsService';
import redis from '../utils/redis';
import * as constants from '../models/Constants.js'

class MallController extends BaseController{
    static async goodslist(ctx){
        ctx.body = ctx.request.body;
        let {searchKey, page, num} = ctx.body;
        num = 10;
        let offset = (page - 1) * num;
        let datalist = await GoodsModel.findByPage(offset, num, searchKey);
        if(datalist){
            for(let i=0; i<datalist.rows.length; i++){
                let good = datalist.rows[i];
                let images = await good.getImages();
                datalist.rows[i].images = images;
                let skus = await good.getSkus();
                datalist.rows[i].skus = skus;

                for(let j=0; j<skus.length; j++) {
                    let sku = skus[j];
                    let firstProperty = await sku.getFirstProperty();
                    let secondProperty = await sku.getSecondProperty();
                    datalist.rows[i].skus[j].firstProperty = firstProperty;
                    datalist.rows[i].skus[j].secondProperty = secondProperty;
                }
            }

            console.log('==========');
            console.log(datalist)
        }

        return ctx.success({
            msg: '操作成功',
            data: datalist
        });
    }

    static async goodsdetail(ctx){
        let { id } = ctx.query;
        if(id) {
            let good = await GoodsModel.findById(id);
            if (good) {
                let face = '';
                let images = await good.getImages();
                good.dataValues.images = images;
                if(images && images.length > 0){
                    for(let k=0; k<images.length; k++){
                        if(images[k].type == 'main'){
                            face = images[k].url;
                            break;
                        }
                    }
                }
                good.dataValues.face = face;

                let skus;
                if(good.is_sku == 1) {
                    skus = await good.getSkus();
                    for (let j = 0; j < skus.length; j++) {
                        let sku = skus[j];
                        let firstProperty = await sku.getFirstProperty();
                        let secondProperty = await sku.getSecondProperty();
                        skus[j].dataValues.firstProperty = firstProperty;
                        skus[j].dataValues.secondProperty = secondProperty;
                    }
                }
                good.dataValues.skus = skus ? skus : [];

                return ctx.success({
                    msg: '操作成功',
                    data: good
                });
            }
            else{
                return ctx.error({
                    code: 10002,
                    msg: '数据不存在',
                    data: null
                });
            }
        }
        else{
            return ctx.error({
                code: 10001,
                msg: '参数缺失',
                data: null
            });
        }
    }

    static async category(ctx){
        ctx.body = ctx.request.body;
        let { num, searchKey } = ctx.body;
        num = 10;
        let datalist = await CategoryModel.findLevelTwoOpen();
        if(datalist){
            for(let i=0; i<datalist.length; i++){
                let path = datalist[i].path;
                let pathGoods = await GoodsModel.findByPath (path, num, searchKey);
                if(pathGoods && pathGoods.length > 0){
                    for(let j=0; j<pathGoods.length; j++){
                        let images = await pathGoods[j].getImages();
                        pathGoods[j].dataValues.images = images;
                        let face = '';
                        if(images && images.length > 0){
                            for(let k=0; k<images.length; k++){
                                if(images[k].type == 'main'){
                                    face = images[k].url;
                                    break;
                                }
                            }
                        }
                        pathGoods[j].dataValues.face = face;
                    }
                }
                datalist[i].dataValues.goodslist = pathGoods;
            }


            console.log('==========');
            console.log(datalist)
        }

        return ctx.success({
            msg: '操作成功',
            data: datalist
        });
    }

    static async ordercreate(ctx){
        ctx.body = ctx.request.body;
        let { money, address, goods } = ctx.body;
        let { third_session } = ctx.query;

        if(!money || !address || !goods || !third_session){
            return ctx.error({
                code: 10001,
                msg: '参数缺失',
                data: null
            });
        }
        else{
            let session = await redis.get(third_session);
            let { openid, session_key } = JSON.parse(session);
            if(openid && session_key){
                let miniuser = await MiniuserModel.findByOpenId(openid);
                if(miniuser){
                    let address_id = '';
                    if(!address.id){
                        //新修改的或新增的地址
                        address.mini_id = miniuser.id;
                        let addRow = await AddressModel.findByDetail({
                            mini_id: miniuser.id,
                            userName: address.userName,
                            postalCode: address.postalCode,
                            provinceName: address.provinceName,
                            cityName: address.cityName,
                            countyName: address.countyName,
                            detailInfo: address.detailInfo,
                            nationalCode: address.nationalCode,
                            telNumber: address.telNumber
                        });
                        if(!addRow){
                            //新增的地址
                            let add = await AddressModel.insertOne(address);
                            address_id = add.id;
                        }
                        else{
                            address_id = addRow.id;
                        }
                    }
                    else{
                        address_id = address.id;
                    }

                    if(address_id) {
                        let orderid = await UtilsService.orderid();
                        let res = await OrdersModel.insertOne(goods, money, orderid, address_id, miniuser.id);
                        if (res) {
                            return ctx.success({
                                msg: '操作成功',
                                data: null
                            });
                        }
                        else {
                            return ctx.error({
                                code: 10004,
                                msg: '创建失败',
                                data: null
                            });
                        }
                    }
                    else{
                        return ctx.error({
                            code: 10005,
                            msg: '地址错误',
                            data: null
                        });
                    }
                }
                else{
                    return ctx.error({
                        code: 10003,
                        msg: '用户不存在',
                        data: null
                    });
                }
            }
            else{
                return ctx.error({
                    code: 10002,
                    msg: '参数错误',
                    data: null
                });
            }
        }
    }

    static async orderlist(ctx){
        ctx.body = ctx.request.body;
        let {searchKey, page, num} = ctx.body;
        let offset = (page - 1) * num;
        let datalist = await OrdersModel.findByPage(offset, num, searchKey);
        if(datalist){
            for(let i=0; i<datalist.rows.length; i++){
                let order = datalist.rows[i];
                let orderGoods = await order.getGoods();
                datalist.rows[i].dataValues.orderGoods = orderGoods;
            }
        }

        return ctx.success({
            msg: '操作成功',
            data: datalist
        });
    }

    static async orderdetail(ctx){
        let { id } = ctx.query;
        if(id) {
            let order = await OrdersModel.findById(id);
            if (order) {
                let orderGoods = await order.getGoods();
                order.dataValues.orderGoods = orderGoods;

                let address = await AddressModel.findById(order.address_id);
                order.dataValues.address = address;

                let process_arr;
                let process = await order.getProcesses();
                if(process){
                    let last = process[process.length - 1];
                    if(last.status == constants.PROCESS_CREATE) {
                        process_arr = [
                            {
                                status: constants.PROCESS_CREATE,
                                lighted: true
                            },
                            {
                                status: constants.PROCESS_PAY,
                                lighted: false
                            },
                            {
                                status: constants.PROCESS_SEND,
                                lighted: false
                            },
                            {
                                status: constants.PROCESS_COMPLETE,
                                lighted: false
                            }
                        ];
                    }
                    else if(last.status == constants.PROCESS_PAY) {
                        process_arr = [
                            {
                                status: constants.PROCESS_CREATE,
                                lighted: true
                            },
                            {
                                status: constants.PROCESS_PAY,
                                lighted: true
                            },
                            {
                                status: constants.PROCESS_SEND,
                                lighted: false
                            },
                            {
                                status: constants.PROCESS_COMPLETE,
                                lighted: false
                            }
                        ];
                    }
                    else if(last.status == constants.PROCESS_SEND) {
                        process_arr = [
                            {
                                status: constants.PROCESS_CREATE,
                                lighted: true
                            },
                            {
                                status: constants.PROCESS_PAY,
                                lighted: true
                            },
                            {
                                status: constants.PROCESS_SEND,
                                lighted: true
                            },
                            {
                                status: constants.PROCESS_COMPLETE,
                                lighted: false
                            }
                        ];
                    }
                    else if(last.status == constants.PROCESS_COMPLETE) {
                        process_arr = [
                            {
                                status: constants.PROCESS_CREATE,
                                lighted: true
                            },
                            {
                                status: constants.PROCESS_PAY,
                                lighted: true
                            },
                            {
                                status: constants.PROCESS_SEND,
                                lighted: true
                            },
                            {
                                status: constants.PROCESS_COMPLETE,
                                lighted: true
                            }
                        ];
                    }
                    else if(last.status == constants.PROCESS_CANCEL) {
                        process_arr = [
                            {
                                status: constants.PROCESS_CREATE,
                                lighted: true
                            },
                            {
                                status: constants.PROCESS_CANCEL,
                                lighted: true
                            }
                        ];
                    }
                    else if(last.status == constants.PROCESS_REFUNDING) {
                        //未发货时申请退款，直接退款成功，已发货时申请退款需要审核（状态为退款中，退款中的只有发货了才能有退款中）
                        process_arr = [
                            {
                                status: constants.PROCESS_CREATE,
                                lighted: true
                            },
                            {
                                status: constants.PROCESS_PAY,
                                lighted: true
                            },
                            {
                                status: constants.PROCESS_SEND,
                                lighted: true
                            },
                            {
                                status: constants.PROCESS_REFUND,
                                lighted: false
                            }
                        ];
                    }
                    else if(last.status == constants.PROCESS_REFUND) {
                        if(process.length == 3) {
                            //未发货时申请退款
                            process_arr = [
                                {
                                    status: constants.PROCESS_CREATE,
                                    lighted: true
                                },
                                {
                                    status: constants.PROCESS_PAY,
                                    lighted: true
                                },
                                {
                                    status: constants.PROCESS_REFUND,
                                    lighted: true
                                }
                            ];
                        }
                        else if(process.length == 4) {
                            //已发货时申请退款
                            process_arr = [
                                {
                                    status: constants.PROCESS_CREATE,
                                    lighted: true
                                },
                                {
                                    status: constants.PROCESS_PAY,
                                    lighted: true
                                },
                                {
                                    status: constants.PROCESS_SEND,
                                    lighted: true
                                },
                                {
                                    status: constants.PROCESS_REFUND,
                                    lighted: true
                                }
                            ];
                        }
                    }
                }
                order.dataValues.process = process_arr;

                return ctx.success({
                    msg: '操作成功',
                    data: order
                });
            }
            else{
                return ctx.error({
                    code: 10002,
                    msg: '数据不存在',
                    data: null
                });
            }
        }
        else{
            return ctx.error({
                code: 10001,
                msg: '参数缺失',
                data: null
            });
        }
    }

    static async address(ctx){
        let { third_session } = ctx.query;
        if(third_session) {
            let session = await redis.get(third_session);
            let { openid, session_key } = JSON.parse(session);
            if(openid && session_key){
                let miniuser = await MiniuserModel.findByOpenId(openid);
                if(miniuser) {
                    let address = await AddressModel.findLatest(miniuser.id);

                    return ctx.success({
                        msg: '操作成功',
                        data: address
                    });
                }
                else{
                    return ctx.error({
                        code: 10003,
                        msg: '用户不存在',
                        data: null
                    });
                }
            }
            else{
                return ctx.error({
                    code: 10002,
                    msg: '参数错误',
                    data: null
                });
            }
        }
        else{
            return ctx.error({
                code: 10001,
                msg: '参数缺失',
                data: null
            });
        }
    }
}

export default MallController;