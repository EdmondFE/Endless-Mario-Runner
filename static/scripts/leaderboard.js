$(document).ready(function(){
    socket.emit('initStats');
    socket.on('leaderboard', function(data){
        let i = 1;
        $('#leaderboard').empty();
       data.stats.sort((a,b)=>{
            return b.score -a.score;
        });
        data.stats.forEach((e) => {
            appendMessage(`${i++}.) <span>${e.name}</span>: ${e.score} `);
        }); 
    });
    const leaderboard = document.getElementById('leaderboard');
    function appendMessage(stats) {
        const statsElement = document.createElement('p');
        statsElement.innerHTML = stats;
        leaderboard.append(statsElement);
    };
    
 
   
});