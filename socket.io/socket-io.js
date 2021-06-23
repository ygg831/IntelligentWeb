
exports.init = function(io) {
  io.sockets.on('connection', function (socket) {
    try {
     // insert here your event
      socket.on('create or join', function(room, userid){
        socket.join(room);
        io.sockets.to(room).emit('joined', room, userid);
      });
      socket.on('chat',function (room, userid, chatText){
        io.sockets.to(room).emit('chat', room, userid, chatText);
      });
      socket.on('disconnect', function (){
        console.log('someone disconnected');
      });
      socket.on('draw', function (room, userId, canvasWidth, canvasHeight, x1, y1, x2, y2, color, thickness){
        io.sockets.emit('draw', room, userId, canvasWidth, canvasHeight, x1, y1, x2, y2, color, thickness);
      });
      socket.on('clean', function (room, userId){
        io.to(room).emit('clean', room, userId);
      });
    } catch (e) {
    }
  });
}
