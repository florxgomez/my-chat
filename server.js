const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'myChatBOT';

//run when a client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {

    //join user to the room
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    //welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to myChat!'));

    //broadcast when a user connects (everybody except the user that is connecting)
    socket.broadcast.to(user.room).emit(
      'message',
      formatMessage(botName, `${user.username} has joined the chat`)
    );
  });
  console.log('New web socket connection...');

  //listen for chatMessage
  socket.on('chatMessage', msg => {
    io.emit('message', formatMessage('USER', msg));
  });

  //runs when client disconnects
  socket.on('disconnect', () => {
    io.emit('message', formatMessage(botName, 'A user has left the chat'));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
