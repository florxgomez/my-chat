const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');

//get username and room from url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io();

//join chatroom
socket.emit('joinRoom', { username, room });

//message from server
socket.on('message', message => {
  outputMessage(message);

  //scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
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
