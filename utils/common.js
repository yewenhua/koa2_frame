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
    },
    decAse192 (str, secret) {
        var decipher = crypto.createDecipher("aes192", secret);
        var dec = decipher.update(str, "hex", "utf8");//编码方式从hex转为utf-8;
        dec += decipher.final("utf8");//编码方式从utf-8;
        return dec;
    },
    encAse192 (str, secret) {
        var cipher = crypto.createCipher("aes192", secret); //设置加密类型 和 要使用的加密密钥
        var enc = cipher.update(str, "utf8", "hex");    //编码方式从utf-8转为hex;
        enc += cipher.final("hex"); //编码方式从转为hex;
        return enc; //返回加密后的字符串
    }
}