module.exports = ws => {
    ws.io.on('connection', (socket)=>{
        console.log('connection');
        socket.on('disconnect', ()=>{
            console.log('disconnect');
            //将退出的用户从在线列表中删除
            if(ws.onlineUsers.hasOwnProperty(socket.uuid)) {
                //退出用户的信息
                var obj = {
                    userid: socket.uuid,
                    username: ws.onlineUsers[socket.uuid].username
                };

                //删除
                delete ws.onlineUsers[socket.uuid];
                //在线人数-1
                ws.count--;

                //向除了自己以外的客户端广播用户退出
                socket.broadcast.emit('logout', {
                    onlineUsers: ws.onlineUsers,
                    number: ws.count,
                    user: obj
                });
                console.log(obj.username + '退出了聊天室');
            }

            //删除全局变量里的socket对象
            if(ws.onlineSockets.hasOwnProperty(socket.uuid)) {
                delete ws.onlineSockets[socket.uuid];
            }
        });

        socket.on('message', (obj)=>{
            console.log('message');
            if(obj.to.userid == '') {
                //向所有客户端广播发布的消息
                ws.io.emit('message', obj);
            }
            else{
                //私聊
                ws.onlineSockets[obj.to.userid].emit('message', obj);
                socket.emit('message', obj);
            }
        });

        socket.on('login', (obj)=>{
            //将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
            socket.uuid = obj.userid;

            //检查在线列表，如果不在里面就加入
            if(!ws.onlineUsers.hasOwnProperty(obj.userid)) {
                ws.onlineUsers[obj.userid] = obj;
                //在线人数+1
                ws.count++;
            }

            //保存socket对象到全局变量
            if(!ws.onlineSockets.hasOwnProperty(obj.userid)) {
                ws.onlineSockets[obj.userid] = socket;
            }

            //向所有客户端广播用户加入
            ws.io.emit('login', {
                onlineUsers: ws.onlineUsers,
                number: ws.count,
                user: obj
            });
            console.log(obj.username + '加入了聊天室');
        });

        socket.on('typing', function(obj){
            if(obj.to.userid != '') {
                ws.onlineSockets[obj.to.userid].emit('typing', obj);
            }
        });

        socket.on('blur', function(obj){
            if(obj.to.userid != '') {
                ws.onlineSockets[obj.to.userid].emit('blur', obj);
            }
        });
    });
}