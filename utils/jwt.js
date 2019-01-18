require('dotenv').config();
const jwt = require('jsonwebtoken');
const secret = process.env.SECRET; //私钥

function generate(data){
    let token = jwt.sign(data, secret, { expiresIn: 2 * 60 * 60 });  //number of seconds
    let refresh_token = jwt.sign(data, secret, { expiresIn: 7 * 24 * 60 * 60 });  //number of seconds
    return {
        token,
        refresh_token
    };
}

function refresh(refresh_token){
    let decoded = verify(refresh_token);
    if(decoded){
        return generate(decoded)
    }
    else{
        return null;
    }
}

function verify(token){
    let decoded = null;
    try{
        decoded = jwt.verify(token, secret);
    }catch(e){
        decoded = null;
    }
    return decoded;
}

module.exports = {
    generate: generate,
    refresh: refresh,
    check: function check(ctx, next) {
        let token;
        if(ctx.header.authorization){
            token = token.split(' ')[1];
        }
        else{
            token = ctx.request.query.token || ctx.request.body.token || '';
        }

        if (token) {
            let decoded = verify(token);
            if (decoded) {

            }
        }
    }
}