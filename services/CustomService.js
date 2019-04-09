import CustomServiceModel from '../models/CustomServiceModel';
import WechatModel from '../models/WechatModel';
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
                params.content = wxData.Content;
            }
            else if(wxData.MsgType == 'video' || wxData.MsgType == 'voice' || wxData.MsgType == 'image'){
                params.mediaId = wxData.MediaId;
            }
            else{

            }
            let access_token = await WechatService.accessToken(APPID, APPSECRET);
            await WechatService.sendCustomMessage(access_token, params);
            return null;
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
            return null;
        }
        else{
            //转到客服系统
            let xml = await WechatService.transfer_customer_service(wxData.ToUserName, wxData.FromUserName);
            return xml;
        }
    }

    static async servicebind(wxData, APPID, APPSECRET){
        let param_str, type, content;
        if(wxData.Content == '专属客服绑定') {
            param_str = 'bind_' + wxData.FromUserName;
            type = 'forever';
            content = '长按识别二维码绑定成为专属客服';
        }
        else{
            param_str = 'unbind_' + wxData.FromUserName;
            type = 'forever';
            content = '扫码二维码解除绑定专属客服';
        }

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

    static async servicebtn(wxData, APPID, APPSECRET){
        let content;
        let info = await CustomServiceModel.findByCustomOpenid(wxData.FromUserName);
        if(info && info.service_openid && info.status == 'bind'){
            //已绑定客服，消息转发到专属客服微信
            //发送信息给专属客服
            let customer = await WechatModel.findByOpenid(wxData.FromUserName);
            let access_token = await WechatService.accessToken(APPID, APPSECRET);
            let params = {
                touser: info.service_openid,
                msgtype: 'text',
                content: '顾客' + (customer ? customer.nickname : '') + '申请在线客服'
            }
            await WechatService.sendCustomMessage(access_token, params);

            //发给用户
            let service = await WechatModel.findByOpenid(info.service_openid);
            content = "您的专属客服是"+ (service ? service.nickname : '') + "，请在下方文本框输入您要咨询的消息";
        }
        else if(info && info.service_openid && info.status == 'unbind'){
            //专属客服已解绑（可随机分配等其他逻辑，看需求）
            let service = await WechatModel.findByOpenid(info.service_openid);
            content = "您的专属客服"+ (service ? service.nickname : '') + "已离职，请在下方文本框输入您要咨询的消息到大众客服";
        }
        else{
            //消息转发到默认客服系统（可随机分配等其他逻辑，看需求）
            content = "请在下方文本框输入您要咨询的消息到大众客服";
        }
        let xml = await WechatService.reply({
            ToUserName: wxData.FromUserName,
            FromUserName: wxData.ToUserName,
            MsgType: 'text',
            Content: content
        });

        return xml;
    }

    static async serviceqrcode(wxData, param_str){
        let xml;
        if(param_str.indexOf('unbind') != -1){
            //解绑二维码，用于交接
            let original_openid = param_str.substring(7);
            await CustomServiceModel.updateCustomService(wxData.FromUserName, original_openid, 'unbind');
            xml = await WechatService.reply({
                ToUserName: wxData.FromUserName,
                FromUserName: wxData.ToUserName,
                MsgType: 'text',
                Content: '客服解绑成功'
            });
        }
        else{
            //绑定二维码
            let service_openid = param_str.substring(5);
            await CustomServiceModel.bindCustomService(wxData.FromUserName, service_openid);
            xml = await WechatService.reply({
                ToUserName: wxData.FromUserName,
                FromUserName: wxData.ToUserName,
                MsgType: 'text',
                Content: '客服绑定成功'
            });
        }
        return xml;
    }
}

export default CustomService