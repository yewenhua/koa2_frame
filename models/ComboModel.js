import Combo from  './shema/combo';
import db from './db'

class ComboModel {

    // 通过 ID 查找文章
    static async findById(id) {
        return await Combo.findById(id);
    };
}

export default ComboModel;