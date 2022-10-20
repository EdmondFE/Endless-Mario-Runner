var socket = io();
$(document).ready(function(){

    const messageContainer = document.getElementById('chat-box');
    const messageInput = document.getElementById('msg-input');
    let person = prompt("Your Name:");
    if(person == null || person == '' || person.length >= 10){
       let e = alert('Name cannot be blank or more than 10 characters');
       (!e)? location.reload(): ''; 
    }
    else{
        appendMessage('You joined');
       socket.emit('userConnect', {name: person});
    }
  
    socket.on('userConnected', function(data) {
       $('#chat-box').append(`<em>${data.name} joined the game.</em>`);
    });
 
    socket.on('userDisconnected', function(data){
         if(data.name !== undefined){
            $('#chat-box').append(`<em>${data.name} has left the game.</em>`);
         } 
     });
     const element = $('#chat-box').children('p');
     socket.on('update', function(data){
         appendMessage(data.chats);
         element.scrollIntoView(false);
      });

     socket.on('chat_history', function(data){
       for(let i = 0; i<data.chats.length;i++){
          appendMessage(data.chats[i]);
       }
     });

     socket.on('all',function(data){
        $('#connected').text(data.count);
     });
 
     $('form').submit(function(e){
          e.preventDefault();
          const message = messageInput.value;
          appendMessage(`<span>You</span>: ${message}`);
          socket.emit('sendMessage', {msg:message, name: person});
          messageInput.value = '';
       return false;
     });

     function appendMessage(message) {
       const messageElement = document.createElement('p');
       messageElement.innerHTML = message;
       messageContainer.append(messageElement);
     };
 
     document.addEventListener('contextmenu', e => e.preventDefault());
 
 }); 