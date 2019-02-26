/**
 * Created by Administrator on 2019/2/21.
 */

const crypto = require('crypto');
function toDou(n) {
    return n < 10 ? '0'+n : n;
}

module.exports = {
    time2date: (timestamp)=>{
        var oDate = new Date();
        oDate.setTime(timestamp);
        var str = oDate.getFullYear() + '-' + toDou(oDate.getMonth() + 1) + '-' + toDou(oDate.getDate()) + ' ' + toDou(oDate.getHours()) + '-' + toDou(oDate.getMinutes()) + '-' + toDou(oDate.getSeconds());
        return str;
    },
    md5: (str)=>{
        var obj = crypto.createHash('md5');
        obj.update(str);
        var res = obj.digest('hex');
        return res;
    }
}