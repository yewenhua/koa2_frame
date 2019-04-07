import Wechat from  './shema/wechat';
import db from './db'

class WechatModel {
    // 通过 ID 查找文章
    static async findById(id) {
        return await Wechat.findById(id);
    };

    static async findByOpenid(openid) {
        return await Wechat.findOne({where: {openid: openid}});
    };

    static async findByUnionid(unionid) {
        return await Wechat.findOne({where: {unionid: unionid}});
    };

    static async insertOne (openid, nickname, sex, subscribe, headimgurl, address, unionid) {
        // 向 user 表中插入数据
        return await Wechat.create({
            openid,
            nickname,
            sex,
            subscribe,
            headimgurl,
            address,
            unionid
        });
    };

    static async updateOne(openid, nickname, sex, subscribe, headimgurl, address, unionid){
        await Wechat.update(
        {
            nickname: nickname,
            sex: sex,
            subscribe: subscribe,
            headimgurl: headimgurl,
            address: address,
            unionid: unionid
        }, {
            where: {
                openid: openid
            }
        });
    }

    static async subscribe (openid) {
        // 向 user 表中插入数据
        return await Wechat.create({
            openid: openid,
            subscribe: 'yes'
        });
    };

    static async updateSubscribeStatus(openid, status){
        await Wechat.update(
            {
                subscribe: status
            }, {
                where: {
                    openid: openid
                }
            });
    }
}

export default WechatModel;