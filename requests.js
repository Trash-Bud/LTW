const rankings = document.getElementById('rank-btn');
const register = document.getElementById('register');
const começar = document.getElementById('begin');
const desistir = document.getElementById('give-up');
var source;

var game_id;
var player_nick;
var board;
var winner;

const getRanking = () => {
  fetch('http://twserver.alunos.dcc.fc.up.pt:8008/ranking',{
      method: 'POST',
      body: JSON.stringify({})
  }).then(res => {
    return res.json()
  }).then(
      data => {
            let table_body = document.getElementById("highscores-table-body");
            if(table_body != null){
                table_body.remove();
            }

            table_body = document.createElement("TBODY");
            table_body.id = "highscores-table-body";
            let table = document.getElementById("highscores-table");

            for (i = 0; i < data.ranking.length; i++){
                table_row = document.createElement("TR");

                let table_data = document.createElement("TD");
                table_content = document.createTextNode(data.ranking[i].nick);
                table_data.appendChild(table_content);
                table_row.appendChild(table_data);

                table_data = document.createElement("TD");
                table_content = document.createTextNode(data.ranking[i].victories);
                table_data.appendChild(table_content);
                table_row.appendChild(table_data);

                table_data = document.createElement("TD");
                table_content = document.createTextNode(data.ranking[i].games);
                table_data.appendChild(table_content);
                table_row.appendChild(table_data);

                table_body.appendChild(table_row);
            }
            table.appendChild(table_body);
        }
  ).catch(error => console.log('ERROR'));
};

const regist = () =>{
    fetch('http://twserver.alunos.dcc.fc.up.pt:8008/register',{
        method: 'POST',
        body: JSON.stringify({
            nick: document.getElementById('nome').value,
            password: document.getElementById('password').value
        })
    }).then(res => {
        return res.json();
    }).then(
        data => {
            if (data.hasOwnProperty('error')){
                throw Error(data.error);
            }
            player_nick = document.getElementById('nome').value;
            if (document.contains(document.getElementById("beg_warning"))) {
                document.getElementById("beg_warning").remove();}  
            var b_auth = document.getElementById("bef-auth");
            var a_auth = document.getElementById("pos-auth");
            var auth_button = document.getElementById("register");
            b_auth.style.display = "none";
            a_auth.style.display = "block";
            const player = document.createElement("DIV");
            player.id = "player-nic";
            player.appendChild(document.createTextNode( "Nome: " + document.getElementById('nome').value));
            a_auth.insertBefore( player, document.getElementById("log-out"));
            auth_button.style.display = "none"; 
        }
    ).catch(error =>{
        if (document.contains(document.getElementById("auth-warning"))) {
            document.getElementById("auth-warning").remove();}  
        const container = document.getElementById("bef-auth");
        const message = document.createElement("DIV");
        message.id = "auth-warning";
        messageText = document.createTextNode(error.message);
        message.classList.add("warning");
        message.appendChild(messageText);
        container.appendChild(message);
    })
}

const join = () =>{
    fetch('http://twserver.alunos.dcc.fc.up.pt:8008/join',{
        method: 'POST',
        body: JSON.stringify({
            group: '085',
            nick: player_nick,
            password: document.getElementById('password').value,
            size: document.getElementById('cavidades').value,
            initial: document.getElementById('sementes').value
        })
    }).then(res => {
      return res.json()
    }).then(
        data => {
            desistir.addEventListener('click', leave);
            game_id = data.game;

            source = new EventSource("http://twserver.alunos.dcc.fc.up.pt:8008/update"+"?nick="+player_nick+"&game="+game_id);
            source.onmessage = (event) =>{
                object = JSON.parse(event.data);

                if (object.hasOwnProperty('board')){
                    board = object;
                    drawBoardFromServer(board);

                }
                if (object.hasOwnProperty('winner')){
                    if (!object.hasOwnProperty('board')){
                        removeWaitMessage();
                        if (object.winner == null){
                            timeOutMessage();
                        }
                        else{
                            //timed out because someone else didn't play for a while
                        }
                    }
                    source.close;
                    player1 = null;
                    player2 = null;
                    giveUp();
                }

            }
        }
    ).catch(error => console.log(error.message))
}

const leave = () =>{
    fetch('http://twserver.alunos.dcc.fc.up.pt:8008/leave',{
        method: 'POST',
        body: JSON.stringify({
            nick: player_nick,
            password: document.getElementById('password').value,
            game: game_id
        })
    }).then(res => {
      return res.json()
    }).then(data => {
        removeWaitMessage();
        source.close();
        player1 = null;
        player2 = null;
        giveUp();
        removeElementsById("board-container");
    }).catch(error => console.log('ERROR'))
}


const notify = (cur_move) =>{
    fetch('http://twserver.alunos.dcc.fc.up.pt:8008/notify',{
        method: 'POST',
        body: JSON.stringify({
            nick: player_nick,
            password: document.getElementById('password').value,
            game: game_id,
            move: cur_move
        })
    }).then(res => {
      return res.json()
    }).then(data => {
        if (data.hasOwnProperty('error')){
            throw Error(data.error);
        }
    }
    ).catch(error => {
        //turn into messages on screen
        console.log(error.message)
    })
}

rankings.addEventListener('click', getRanking);
register.addEventListener('click', regist);

    



