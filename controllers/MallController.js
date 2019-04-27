import BaseController from './BaseController';

class MallController extends BaseController{
    static async minilogin(ctx){
        ctx.body = ctx.request.body;

    }
}

export default MallController;