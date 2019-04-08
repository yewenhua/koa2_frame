
const fs = require('fs')
const request = require('request')
const download = require('download');

(async ()=>{
    let media_path = 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=gQHO8jwAAAAAAAAAAS5odHRwOi8vd2VpeGluLnFxLmNvbS9xLzAyMThTVkZoMWtlM0QxMDAwMDAwN3IAAgSFn6lcAwQAAAAA';
//let data = fs.readFileSync(media_path);
//let data = fs.createReadStream(media_path);

// let data = request.post(media_path, {
//     form: {
//         param:"param"
//     }
// }).pipe(fs.createWriteStream('./static/service/a.jpg'))

    console.log("00000000000");
    let data = await download(media_path).pipe(fs.createWriteStream('./static/service/a.png'));

    console.log("111111111111");
    console.log(data);
})();