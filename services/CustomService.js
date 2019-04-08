import CustomServiceModel from '../models/CustomServiceModel';
import WechatService from './WechatService';

class CustomService {
    static async servicetrans(wxData, APPID, APPSECRET){
        //判断当前用户身份
        console.log('jjjjjjjjjjjjjjjj');
        let serviceInfo = await CustomServiceModel.findByCustomOpenid(wxData.FromUserName);
        let customInfo = await CustomServiceModel.findByServiceOpenid(wxData.FromUserName);
        if(serviceInfo && serviceInfo.service_openid && serviceInfo.status == 'bind'){
            //当前身份是用户，已绑定专属客服，收到的是自己发送的消息,转到专属客服
            let params = {
                touser: serviceInfo.service_openid,
                msgtype: wxData.MsgType
            };

            if(wxData.MsgType == 'text'){
                params.content = wxData.Content;
            }
            else if(wxData.MsgType == 'video' || wxData.MsgType == 'voice' || wxData.MsgType == 'image'){
                params.mediaId = wxData.MediaId;
            }
            else{

            }
            let access_token = await WechatService.accessToken(APPID, APPSECRET);
            await WechatService.sendCustomMessage(access_token, params);
        }
        else if(customInfo && customInfo.custom_openid && customInfo.status == 'bind'){
            //当前身份是客服，收到的是自己发送的消息，转到客户
            let params = {
                touser: customInfo.custom_openid,
                msgtype: wxData.MsgType
            };

            if(wxData.MsgType == 'text'){
                params.content = wxData.Content;
            }
            else if(wxData.MsgType == 'video' || wxData.MsgType == 'voice' || wxData.MsgType == 'image'){
                params.mediaId = wxData.MediaId;
            }
            else{

            }
            let access_token = await WechatService.accessToken(APPID, APPSECRET);
            await WechatService.sendCustomMessage(access_token, params);
        }
        else{
            //转到客服系统
            let xml = await WechatService.transfer_customer_service(wxData.ToUserName, wxData.FromUserName);
            return xml;
        }
    }

    static async servicebind(wxData, APPID, APPSECRET){
        let param_str, type;
        if(wxData.Content == '专属客服绑定') {
            param_str = 'bind_' + wxData.FromUserName;
            type = 'forever';
        }
        else{
            param_str = 'unbind_' + wxData.FromUserName;
            type = 'forever';
        }

        //生成二维码
        let access_token = await WechatService.accessToken(APPID, APPSECRET);
        let qrcode_img_url = await WechatService.qrcode(access_token, type, param_str);

        console.log('00000000000000');
        console.log(qrcode_img_url);
        //上传图片获取media_id，发送图片消息给客服
        let resUp = await WechatService.uploadMediaFile(access_token, qrcode_img_url, type, 'image');
        let params = {
            touser: wxData.FromUserName,
            msgtype: 'image',
            media_id: resUp.media_id
        }
        await WechatService.sendCustomMessage(access_token, params);

        let content = '长按识别二维码绑定成为专属客服';
        let xml = await WechatService.reply({
            ToUserName: wxData.FromUserName,
            FromUserName: wxData.ToUserName,
            MsgType: 'text',
            Content: content
        });

        return xml;
    }

    static async servicebtn(wxData, APPID, APPSECRET){
        let content;
        let info = await CustomServiceModel.findByCustomOpenid(wxData.FromUserName);
        if(info && info.service_openid && info.status == 'bind'){
            //已绑定客服，消息转发到专属客服微信
            //发送信息给专属客服
            let access_token = await WechatService.accessToken(APPID, APPSECRET);
            let params = {
                touser: info.service_openid,
                msgtype: 'text',
                content: '顾客XXX申请在线客服'
            }
            await WechatService.sendCustomMessage(access_token, params);

            //发给用户
            content = "您的专属客服是九指神丐，请在下方文本框输入您要咨询的消息";
        }
        else if(info && info.service_openid && info.status == 'unbind'){
            //专属客服已解绑（可随机分配等其他逻辑，看需求）
            content = "您的专属客服已离职，请在下方文本框输入您要咨询的消息到大众客服";
        }
        else{
            //消息转发到默认客服系统（可随机分配等其他逻辑，看需求）
            content = "请在下方文本框输入您要咨询的消息到大众客服";
        }
        let xml = await WechatService.reply(content, wxData.ToUserName, wxData.FromUserName);

        return xml;
    }

    static async serviceqrcode(wxData, param_str){
        console.log('5555555555');
        if(param_str.indexOf('unbind') != -1){
            //解绑二维码，用于交接
            console.log('66666666666666');
            let original_openid = param_str.substring(7);
            await CustomServiceModel.updateCustomService(wxData.FromUserName, original_openid);
        }
        else{
            //绑定二维码
            console.log('777777777777777');
            let service_openid = param_str.substring(5);
            await CustomServiceModel.bindCustomService(wxData.FromUserName, service_openid);
        }
    }
}

export default CustomService