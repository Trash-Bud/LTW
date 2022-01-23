const rankings = document.getElementById('rank-btn');
const register = document.getElementById('register');
const começar = document.getElementById('begin');
const desistir = document.getElementById('give-up');
var source;

var game_id;
var player_nick = "";
var board;
var winner;

var paths =[["http://twserver.alunos.dcc.fc.up.pt:8008/ranking",
            "http://twserver.alunos.dcc.fc.up.pt:8008/register",
            "http://twserver.alunos.dcc.fc.up.pt:8008/join",
            "http://twserver.alunos.dcc.fc.up.pt:8008/update",
            "http://twserver.alunos.dcc.fc.up.pt:8008/leave",
            "http://twserver.alunos.dcc.fc.up.pt:8008/notify"],
            ["/ranking",
            "/register",
            "/join",
            "/update",
            "leave",
            "/notify"]]

const getRanking = () => {
  fetch(paths[server][0],{
      method: 'POST',
      body: JSON.stringify({})
  }).then(res => {
    return res.json()
  }).then(
      data => {
            if (data.hasOwnProperty('error')){
                throw Error(data.error);
            }
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
  ).catch(error => console.log(error.message));
};

const regist = () =>{
    fetch(paths[server][1],{
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
    fetch(paths[server][2],{
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
            if (data.hasOwnProperty('error')){
                throw Error(data.error);
            }
            else if (player_nick == ""){
                throw Error("Name and password cannot be empty");
            }
            
            begin_server();
            game_id = data.game;
            desistir.addEventListener('click', leave);

            source = new EventSource(paths[server][3]+"?nick="+player_nick+"&game="+game_id);
            source.onmessage = (event) =>{
                object = JSON.parse(event.data);
                console.log(object);
                if (object.hasOwnProperty('board')){
                    board = object;
                    drawBoardFromServer(board,false);

                }
                if (object.hasOwnProperty('winner')){
                    if (!object.hasOwnProperty('board')){
                        removeWaitMessage();
                        if (object.winner == null){
                            timeOutMessage();
                        }
                        else{
                            timeOutMessage();
                        }
                    }
                    else drawBoardFromServer(board,true);
                    source.close;
                    player1 = null;
                    player2 = null;
                    giveUp();
                }

            }
        }
    ).catch(error => {
        join_warning(error.message);
    })
}



const leave = () =>{
    fetch(paths[server][4],{
        method: 'POST',
        body: JSON.stringify({
            nick: player_nick,
            password: document.getElementById('password').value,
            game: game_id
        })
    }).then(res => {
      return res.json()
    }).then(data => {
        if (data.hasOwnProperty('error')){
            throw Error(data.error);
        }
        removeWaitMessage();
        source.close();
        player1 = null;
        player2 = null;
        giveUp();
        removeElementsById("board-container");
    }).catch(error => console.log(error.message))
}


const notify = (cur_move) =>{
    fetch(paths[server][5],{
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
        if (document.contains(document.getElementById("warning"))) {
            document.getElementById("warning").remove();} 

        const warning = document.createElement("DIV");
        warning.id = "warning";
        warning.classList.add("warning");
        let text = document.createTextNode(error.message);
        warning.appendChild(text);

        let container = document.getElementById("right-container");
        container.appendChild(warning);
    })
}

rankings.addEventListener('click', getRanking);
register.addEventListener('click', regist);

    



