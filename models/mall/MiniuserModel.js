import Model from  '../shema/mall/miniuser';
import { db_mall } from '../db'

class MiniuserModel {

    // 通过 ID 查找文章
    static async findById(id) {
        return await Model.Miniuser.findById(id);
    };

    static async findByOpenId(openid) {
        return await Model.Miniuser.findOne({
            where: {
                openid: openid
            }
        });
    };

    static async insertOne (params) {
        return await db_mall.transaction(async (t)=>{
            let rtn =  await Model.Miniuser.create(params, {transaction: t});

            let router = params.parent_key + ',' + rtn.id;
            let res = await Model.Miniuser.update(
                {
                    router: router
                },
                {
                    transaction: t,
                    where: {
                        id: rtn.id
                    }
                }
            );

            if(!res[0] || !rtn){
                //回滚
                throw new Error();
            }
            return rtn;
        });
    };
}

export default MiniuserModel;