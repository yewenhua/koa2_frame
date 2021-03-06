/**
 * Created by Administrator on 2019/4/9.
 */
import WechatService from './WechatService';
import WechatModel from '../models/WechatModel';

class InteractionService {
    static async qrcode(wxData, APPID, APPSECRET){
        let param_str = 'sign_' + wxData.FromUserName;
        let type = 'forever';
        let content = '你的入口签到二维码，请注意查收';
        console.log('11111111111');
        //生成二维码
        let access_token = await WechatService.accessToken(APPID, APPSECRET);
        let qrcode_img_url = await WechatService.qrcode(access_token, type, param_str);

        //上传图片获取media_id，发送图片消息给客服
        let resUp = await WechatService.uploadMediaFile(access_token, qrcode_img_url, type, 'image');
        if(resUp) {
            console.log('22222222222222');
            console.log(resUp);
            let params = {
                touser: wxData.FromUserName,
                msgtype: 'image',
                mediaId: resUp.media_id
            }
            await WechatService.sendCustomMessage(access_token, params);

            let xml = await WechatService.reply({
                ToUserName: wxData.FromUserName,
                FromUserName: wxData.ToUserName,
                MsgType: 'text',
                Content: content
            });

            return xml;
        }
        else{
            return null;
        }
    }

    static async sign(wxData, param_str){
        let xml;
        let userInfo = await WechatModel.findByOpenid(wxData.FromUserName);

        xml = await WechatService.reply({
            ToUserName: wxData.FromUserName,
            FromUserName: wxData.ToUserName,
            MsgType: 'news',
            Articles: [
                {
                    Title: '您好，' + (userInfo ? (userInfo.nickname + '，') : '') + '签到成功',
                    Description: '点击查看并添加更多信息，八荒六合唯我独尊~',
                    PicUrl: (userInfo ? userInfo.headimgurl : 'https://share.voc.so/app/images/t77_thumb@2x.png'),
                    Url: 'http://maoxy.com',
                }
            ]
        });

        return xml;
    }
}

export default InteractionService;