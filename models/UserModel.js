import Sequelize from 'sequelize';
import User from  './shema/users';
import Memcombo from  './shema/memcombo';
import Charge from  './shema/charge';
import Combo from  './shema/combo';
import ComboSite from  './shema/combo_site';
import Paylog from  './shema/paylog';
import Images from  './shema/images';
import { db } from './db'

const Op = Sequelize.Op;
class UserModel {
    // 添加新用户
    static async addUser (password, secret) {
        // 向 user 表中插入数据
        return await User.create({
            password: password,
            secret: secret
        });
    };

    static async addByOpenid (openid, password, secret, combo_id, num, uid, isopen, type, mark, money) {
        return await User.create({
            password: password,
            secret: secret
        });
    };

    // 通过卡密查找用户
    static async findByPwd (pwd) {
        return await User.findOne({where: {password: pwd}});
    };

    // 通过 ID 查找文章
    static async findById(id) {
        return await User.findById(id);
    };

    // 通过用户名查找用户
    static async Login (password, secret) {
        return await User.findOne({where: {password: password, secret: secret}});
    };

    //激活
    static async Activate (pwd_id, combo_id) {
        return await db.transaction(async (t)=>{
            //1 查询套餐所有的网站
            let cSites = await ComboSite.findAll({
                where: {
                    combo_id: combo_id,
                    deletedAt: null
                }
            }, {transaction: t});

            let arr = [];
            for(let i=0; i<cSites.length; i++){
                arr.push({
                    pwd_id: pwd_id,
                    site_id: cSites[i].website_id,
                    count: cSites[i].count
                });
            }

            //2 生成会员套餐
            await Memcombo.bulkCreate(arr, {transaction: t});

            let cInfo = await Combo.findOne({where: {id: combo_id}});
            if (cInfo.timelong == 0) {
                var endTime = (new Date()).getTime() + 20 * 365 * 24 * 60 * 60 * 1000;
            }
            else {
                var endTime = (new Date()).getTime() + cInfo.timelong * 24 * 60 * 60 * 1000;
            }
            let begin = new Date();
            let end = (new Date()).setTime(endTime);

            //3 更新卡密用户信息
            await User.update(
                {
                    begin: begin,
                    end: end,
                    active_time: begin,
                    count: cInfo.count,
                    point: cInfo.point,
                    status: 1,
                },
                {
                    transaction: t,
                    where: {
                        id: pwd_id
                    }
                }
            );

            let uInfo = await User.findOne({where: {id: pwd_id}});

            //4 生成充值记录信息
            let rtn = await Charge.create({
                pwd_id: pwd_id,
                password: uInfo.password
            }, {transaction: t});

            return rtn;
        });
    }

    //次数卡扣费
    static async payCountMoney(pwd_id, count, result){
        return await db.transaction(async (t)=>{
            //1 更新卡密用户信息
            let res = await User.update(
                {
                    count: Sequelize.literal('count - ' + count)
                },
                {
                    transaction: t,
                    where: {
                        id: pwd_id,
                        count: {
                            [Op.gte]: count
                        }
                    }
                }
            );

            //2 生成支付记录信息
            let rtn = await Paylog.create({
                pwd_id: pwd_id,
                type: 'image',
                count: count
            }, {transaction: t});

            //3 生成上传信息记录
            let arr = [];
            for(let i=0; i<result.length; i++){
                if(result[i].status == 'success'){
                    arr.push({
                        pwd_id: pwd_id,
                        url: result[i].url,
                        label: result[i].label,
                        result: JSON.stringify(result[i].data),
                        pay_id: rtn ? rtn.id : '',
                        status: 'payed'
                    });
                }
                else{
                    arr.push({
                        pwd_id: pwd_id,
                        url: result[i].url,
                        label: result[i].label,
                        result: '',
                        pay_id: '',
                        status: 'notpay'
                    });
                }
            }

            let resImg = await Images.bulkCreate(arr, {transaction: t});


            if(!res[0] || !rtn || !resImg){
                //回滚
                throw new Error();
            }
            return rtn;
        });
    }

    //天卡扣费
    static async payDayMoney(pwd_id, count, site_id){
        return await db.transaction(async (t)=>{
            //1 更新卡密用户信息
            let resFirst = await User.update(
                {
                    count: Sequelize.literal('count - ' + count)
                },
                {
                    transaction: t,
                    where: {
                        id: pwd_id,
                        count: {
                            [Op.gte]: count
                        }
                    }
                }
            );

            //2 更新用户套餐信息
            let resSecond = await Memcombo.update(
                {
                    count: Sequelize.literal('count - ' + count)
                },
                {
                    transaction: t,
                    where: {
                        pwd_id: pwd_id,
                        site_id: site_id,
                        count: {
                            [Op.gte]: count
                        }
                    }
                }
            );

            //3 生成支付记录信息
            let rtn = await Paylog.create({
                pwd_id: pwd_id,
                count: count
            }, {transaction: t});

            if(!resFirst[0] || !resSecond[0] || !rtn){
                //回滚
                throw new Error();
            }
            return rtn;
        });
    }

    //积分扣费
    static async payPoint(pwd_id, point){
        return await db.transaction(async (t)=>{
            //1 更新卡密用户信息
            let res = await User.update(
                {
                    point: Sequelize.literal('point - ' + point)
                },
                {
                    transaction: t,
                    where: {
                        id: pwd_id,
                        point: {
                            [Op.gte]: point
                        }
                    }
                }
            );

            //2 生成支付记录信息
            let rtn = await Paylog.create({
                pwd_id: pwd_id,
                point: point
            }, {transaction: t});

            if(!res[0] || !rtn){
                //回滚
                throw new Error();
            }
            return rtn;
        });
    }
}

export default UserModel;