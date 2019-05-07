const lodash = require("lodash");

class UtilsService {
    static async random_str(length) {
        let arr = [
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
            1, 2, 3, 4, 5, 6, 7, 8, 9, 0,
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
        ]
        let arr_length = arr.length;
        let str = '';
        for (let i = 0; i < length; i++)
        {
            let rand = lodash.random(0, arr_length-1);
            str += arr[rand];
        }

        return str;
    }

    static async orderid() {
        var dataObj = new Date();
        var year = dataObj.getFullYear();
        var month = dataObj.getMonth() + 1;
        var monthstr = month < 10 ? ('0' + month) : month;
        var day = dataObj.getDate();
        var daystr = day < 10 ? ('0' + day) : day;
        var hour = dataObj.getHours();
        var hourstr = hour < 10 ? ('0' + hour) : hour;
        var min = dataObj.getMinutes();
        var minstr = min < 10 ? ('0' + min) : min;
        var sec = dataObj.getSeconds();
        var secstr = sec < 10 ? ('0' + sec) : sec;
        var random_str = lodash.random(100000, 999999);
        var fullstr = year + monthstr + daystr + hourstr + minstr + secstr + random_str;

        return fullstr;
    }
}

export default UtilsService