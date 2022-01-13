

let responses = [];
let player_list = [];
let game_list = [];

module.exports.remember = function(response,url) {
    if (i == 7 && url[7] != '?') return false;
    if ( url.substring(8, 13) != "nick=") return false;
    var i = 13;
    while(url[i] != '&'){
        i++;
    }
    var player = url.substring(13, i);
    if ( url.substring(i, i+6) != "&game=") return false;
    var game = url.substring(i+6, url.length);

    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Connection", "keep-alive");

    responses.push(response);
    player_list.push(player);
    game_list.push(game);
    
    return true;
}

module.exports.forget = function(response) {
    let pos = responses.findIndex((resp) => resp === response);
    if(pos > -1){
      responses.splice(pos,1);
      player_list.splice(pos,1);
      game_list.splice(pos,1);
    }
}

module.exports.update_game = function(game,message) {

    for(var i = 0; i < responses.length;i++) {
        
        if(game_list[i] == game) {responses[i].write('data: ' + message + '\n\n')};
    }
}

module.exports.update_player = function(player,message) {
    console.log(message);
    for(var i = 0; i < responses.length;i++) {
        if(player_list[i] == player){ 
            responses[i].write('data: ' + message + '\n\n')}
    }
}