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

        //生成二维码
        let access_token = await WechatService.accessToken(APPID, APPSECRET);
        let qrcode_img_url = await WechatService.qrcode(access_token, type, param_str);

        //上传图片获取media_id，发送图片消息给客服
        let resUp = await WechatService.uploadMediaFile(access_token, qrcode_img_url, type, 'image');
        if(resUp) {
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
            MsgType: 'text',
            Content: '您好，' + (userInfo ? (userInfo.nickname + '，') : '') + '签到成功'
        });
        return xml;
    }
}

export default InteractionService;