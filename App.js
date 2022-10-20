const e = require('express');
const express = require('express');
const app = express();
const path = require("path");
const server = app.listen(8000);
const io = require('socket.io')(server);
app.use(express.static(path.join(__dirname, "./static")));//Express for static content
app.set('views', path.join(__dirname, './views'));//EJS for dynamic content
app.set('view engine', 'ejs');


let users = {};
let chat_history = [];
let count;
let temp = {};
let leaderboard = [];

io.on('connection', function(socket){
    console.log('user Connected!');
    socket.on('userConnect', function(data){
        //mutable data
        users[socket.id] = data.name;
        count = Object.keys(users).length;
        temp = {name: users[socket.id], score: 0};
        leaderboard.push(temp);
    
        //transfer datas to client
        io.emit('all', {count: count});
        socket.emit('userName', {name: users[socket.id]});
        socket.broadcast.emit('userConnected', {name:  data.name});   
    });
   
    socket.emit('chat_history', {chats: chat_history});
    socket.on('sendMessage', function(data){
        chat_history.push("<span>"+data.name+"</span>: "+data.msg);
        socket.broadcast.emit('update', {chats: chat_history[chat_history.length-1]});
    });
    socket.on('disconnect', function(){  
        socket.broadcast.emit('userDisconnected', {name: users[socket.id]});
        delete users[socket.id];
        count = Object.keys(users).length;
        io.emit('all', {count: count});
    });

    socket.on('score', function(data){
        for (const obj of leaderboard) {
            if (obj.name  === data.name && obj.score < data.score) {
                obj.score = data.score;
                io.emit('leaderboard', {stats: leaderboard});
                break;
            }
        }
    });
    socket.on('initStats', function(){
        io.emit('leaderboard', {stats: leaderboard});
    });
    socket.on('initGame', function(){
        socket.emit('mario', {name: users[socket.id]});
        socket.emit('gameState');
    });
    socket.on('move', function(){
        
    });
 
      
    
  
   

   
});

app.get('/', function(request, response){
    response.render('index', {'Content-Type':'text/html', count: count});
}); 