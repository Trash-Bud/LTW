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
        if (!res.ok){
            throw Error('User registered with a different password');
        }
        return res.json();
      
    }).then(
        data => {
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
                else if (object.hasOwnProperty('winner')){
                    winner = object;
                    console.log("winner:)");
                    console.log(winner.winner);
                }

            }
        }
    ).catch(error => console.log('ERROR'))
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
        source.close;
        
    }).catch(error => console.log('ERROR'))
}


const notice = () =>{
    fetch('http://twserver.alunos.dcc.fc.up.pt:8008/notice',{
        method: 'POST',
        body: JSON.stringify({
            nick: player_nick,
            password: document.getElementById('password').value,
            game: game_id,
            move: ' '
        })
    }).then(res => {
      return res.json()
    }).then(data => {
    }
    ).catch(error => console.log('ERROR'))
}

rankings.addEventListener('click', getRanking);
register.addEventListener('click', regist);
começar.addEventListener('click', join);

