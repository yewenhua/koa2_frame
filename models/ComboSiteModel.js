import ComboSite from  './shema/combo_site';
import db from './db'

class ComboSiteModel {
    // 通过website_id查找
    static async findByWebsiteId (website_id) {
        return await ComboSite.findOne({where: {website_id: website_id}});
    };

    // 通过combo_id查找
    static async findByComboId (combo_id) {
        return await ComboSite.findOne({where: {combo_id: combo_id}});
    };

    // 通过 ID 查找文章
    static async findById(id) {
        return await ComboSite.findById(id);
    };
}

export default ComboSiteModel;