import CustomServiceModel from '../models/CustomServiceModel';
import WechatService from './WechatService';

class CustomService {
    static async servicetrans(wxData, APPID, APPSECRET){
        //判断当前用户身份
        let serviceInfo = await CustomServiceModel.findByCustomOpenid(wxData.FromUserName);
        let customInfo = await CustomServiceModel.findByServiceOpenid(wxData.FromUserName);
        if(serviceInfo && serviceInfo.service_openid && serviceInfo.status == 'bind'){
            //当前身份是用户，已绑定专属客服，收到的是自己发送的消息,转到专属客服
            let params = {
                touser: serviceInfo.service_openid,
                msgtype: wxData.MsgType
            };

            if(wxData.MsgType == 'text'){
                params.content = jsonData.Content;
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
                params.content = jsonData.Content;
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
        let param_str;
        if(jsonData.Content == '专属客服绑定') {
            param_str = 'bind_' + wxData.FromUserName;
        }
        else{
            param_str = 'unbind_' + wxData.FromUserName;
        }

        //生成二维码
        console.log('22222222222222');
        let access_token = await WechatService.accessToken(APPID, APPSECRET);
        console.log(access_token);
        let qrcode_img_url = await WechatService.qrcode(access_token, 'forever', param_str);
        console.log('3333333333333333');
        console.log(qrcode_img_url);

        //上传图片获取media_id，发送图片消息给客服
        let resUp = await WechatService.uploadMediaFile(access_token, qrcode_img_url, 'shorttime', 'image');
        console.log('444444444444444');
        console.log(resUp);
        let params = {
            touser: wxData.FromUserName,
            msgtype: 'image',
            media_id: resUp.media_id
        }
        await WechatService.sendCustomMessage(access_token, params);
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
        if(param_str.indexOf('unbind') !== false){
            //解绑二维码，用于交接
            let original_openid = param_str.substring(6);
            await CustomServiceModel.updateCustomService(wxData.FromUserName, original_openid);
        }
        else{
            //绑定二维码
            let service_openid = param_str.substring(4);
            await CustomServiceModel.bindCustomService(wxData.FromUserName, service_openid);
        }
    }
}

export default CustomService