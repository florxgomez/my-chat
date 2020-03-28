const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const inputMsg = document.getElementById('msg');
const chatTyping = document.querySelector('.chat-typing');

//get username and room from url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io();

//join chatroom
socket.emit('joinRoom', { username, room });

//get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

//message from server
socket.on('message', message => {
  outputMessage(message);

  //scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('typing', user => {
  outputTyping(user);
});

socket.on('notTyping', () => {
  chatTyping.innerHTML = '';
});

let timeout = null;

inputMsg.addEventListener('keyup', () => {
  socket.emit('typing');
  clearTimeout(timeout);

  timeout = setTimeout(function() {
    socket.emit('notTyping');
  }, 1000);
});

//message submit
chatForm.addEventListener('submit', e => {
  e.preventDefault();

  //get message text
  const msg = e.target.elements.msg.value;

  //emit message to server
  socket.emit('chatMessage', msg);

  //clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
  socket.emit('notTyping');
});

//output message to DOM
function outputMessage(msg) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${msg.username} <span>${msg.time}</span></p>
  <p class="text">
    ${msg.text}
  </p>`;
  chatMessages.appendChild(div);
}

//add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

//add users to DOM
function outputUsers(users) {
  userList.innerHTML = `
  ${users.map(user => `<li>${user.username}</li>`).join('')}
  `;
}

//output 'typing' to DOM
function outputTyping(user) {
  chatTyping.innerHTML = `${user.username} is typing...`;
}
