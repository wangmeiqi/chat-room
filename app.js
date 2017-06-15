var express = require('express');
var app = express();
app.use(express.static(__dirname));
app.get('/', function (req, res) {
  res.sendFile('./index.html')
});
var server = require('http').createServer(app);
//得到io对象
var io = require('socket.io')(server);
var users = {};
io.on('connection', function (socket) {
  var username;
  var room;
  socket.emit('message', {user: '系统', content: '欢迎来到聊天室，请输入昵称'});
  socket.on('join', function (rm) {
    socket.join(rm);
    room = rm;
  });
  //USERS
  socket.on('users', function () {
    socket.emit('users', Object.keys(users));
  });
  socket.on('message', function (msg) {
    if (username) {
      var result = msg.match(/@(.+)\s(.+)/);
      if (result) {
        var toUser = result[1];
        var content = result[2];
        //得到对方的socket 发消息 发送方就是本人
        users[toUser].emit('message', {user: username, content: content});
        socket.emit('message', {user: username, content: content})
      } else {
        if(room){
          io.sockets.in(room).emit('message',{user: username, content: msg})
        }else {
          io.emit('message', {user:username,content:msg});
        }
        //io.emit('message', {user:username,content:msg});
        //io.sockets.in(room).emit('message',{user: username, content: msg})
      }
    } else {
      username = msg;
      //缓存所有的用户名和socket
      users[username] = socket;
      io.emit('users', Object.keys(users));
      io.emit('message', {user: '系统', content: '欢迎<span>' + username + '</span>加入聊天室'});
    }
  })
});
server.listen(8080);