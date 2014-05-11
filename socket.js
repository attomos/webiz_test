var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var execSync = require('execSync');

server.listen(8080);

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket) {
  socket.emit('news', { hello: 'world' });
  var date = execSync.stdout('pmacct -s');
  socket.emit('message', { data: date});
  socket.on('requestMore', function(data) {
    date = execSync.stdout('pmacct -s');
    socket.emit('message', { data: date} );
  });
  socket.on('my other event', function(data) {
    console.log(data);
  });
});
