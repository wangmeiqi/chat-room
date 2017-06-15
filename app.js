var express = require('express');
var app = express();
app.use(express.static(__dirname));
app.get('/', function (req, res) {
  res.sendFile('./index.html')
});
var server = require('http').createServer(app);
//得到io对象
var io = require('socket.io')(server);
io.on('connection', function (socket) {
  var username;
  socket.emit('message',{user:'系统',content:'欢迎来到聊天室，请输入昵称'});
  socket.on('message', function (msg) {
    if(username){
      var result=msg.match(/@(.+)\s(.+)/);
      if(result){
        var  toUser=result[1];
        var msg=result[2];
      }else {
        io.emit('message', {user:username,content:msg});
      }
    }else {
      username=msg;
      io.emit('message', {user:'系统',content:'欢迎'+username+'加入聊天室'});
    }
  })
});
server.listen(8080);