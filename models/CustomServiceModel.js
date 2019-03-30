import CustomService from  './shema/custom_service';
import db from './db'

class CustomServiceModel {
    // 通过 ID 查找文章
    static async findById(id) {
        return await CustomService.findById(id);
    };

    static async findByCustomOpenid(openid) {
        return await CustomService.findOne({where: {custom_openid: openid}});
    };

    static async findByServiceOpenid(openid) {
        return await CustomService.findOne({where: {service_openid: openid}});
    };

    static async bindCustomService (custom_openid, service_openid) {
        // 向 user 表中插入数据
        return await CustomService.create({
            custom_openid: custom_openid,
            service_openid: service_openid,
            status: 'bind'
        });
    };

    static async updateCustomService(new_service_openid, old_service_openid){
        await CustomService.update(
        {
            service_openid: new_service_openid,
            status: 'bind'
        }, {
            where: {
                service_openid: old_service_openid
            }
        });
    }
}

export default CustomServiceModel;