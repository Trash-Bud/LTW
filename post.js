const fs   = require('fs');
const crypto = require('crypto');

let board = {};

module.exports.register = function(request, response){
    getRequestBody(request, result => {
        if (!result.hasOwnProperty('nick') || !result.hasOwnProperty('password')){
            response.statusCode = 400;
            response.end(JSON.stringify({"error": "Bad Arguments!"}));

        }
        else if (result.nick == "" || result.password == ""){
            response.statusCode = 400;
            response.end(JSON.stringify({"error": "Name and password cannot be empty"}));
        }
        else{
            findUser(result.nick,result.password,response);
        }
    });
}

function addUser(nick, password){
    fs.readFile('data/users.json',function(err, data){
        var obj = JSON.parse(data);
        let salt = crypto.randomBytes(16).toString('hex');
        let hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
        obj['users'].push({"nick":nick, "password":hash, "salt":salt});
        fs.writeFile('data/users.json',JSON.stringify(obj),function(err){
        })
    });
}

function findUser(nick, password, response){
    fs.readFile('data/users.json',function(err, data){
        var obj = JSON.parse(data).users;
        let found = obj.filter(
            function(obj){ return obj.nick == nick }
        );
        if (found.length == 0){
            addUser(nick,password);
            response.statusCode = 200;
            response.end(JSON.stringify({}));
        }
        else{
            let hash1 = crypto.pbkdf2Sync(password, 
                found[0].salt, 1000, 64, `sha512`).toString(`hex`);
            if (found[0].password == hash1){
                response.statusCode = 200;
                response.end(JSON.stringify({}));
            }
            else{
                response.statusCode = 401;
                response.end(JSON.stringify({"error": "User registered with a different password"}));
            }
        }
    });
}

function authenticateUser(nick, password, response, callback){
    fs.readFile('data/users.json',function(err, data){
        var obj = JSON.parse(data).users;
        let found = obj.filter(
            function(obj){ return obj.nick == nick }
        );
        if (found.length == 0){
            response.statusCode = 401;
            response.end(JSON.stringify({"error": "No user found"}));
            callback(false);
        }
        else{
            let hash1 = crypto.pbkdf2Sync(password, 
                found[0].salt, 1000, 64, `sha512`).toString(`hex`);
            if (found[0].password != hash1){
                response.statusCode = 401;
                response.end(JSON.stringify({"error": "User registered with a different password"}));
                callback(false);
            }
            callback(true);
        }
    });
}


module.exports.ranking = function(res){
    fs.readFile('data/ranking.json',function(err, data){
        res.statusCode = 200;
        res.end(JSON.stringify(JSON.parse(data)));
    });
}

module.exports.leave = function(request, response, updater){
    getRequestBody(request, result => {
        if (!result.hasOwnProperty('nick') || !result.hasOwnProperty('password') || !result.hasOwnProperty('game')){
            response.statusCode = 400;
            response.end(JSON.stringify({"error": "Bad Arguments!"}));     
        }
        else{
            authenticateUser(result.nick, result.password, response, auth => {
                if (auth == true){
                    fs.readFile('data/groups.json',function(err, data){
                        if(verifyIfPlayerInGame(result.nick,response,data,result.game,updater)){
                            removePlayer(result.nick);
                            response.statusCode = 200;
                            response.end(JSON.stringify({}));
                        }
                    });
                }
            });
        }
    });
}

module.exports.join = function(request, response, updater){
    getRequestBody(request, result => {
        if (!result.hasOwnProperty('nick') || !result.hasOwnProperty('password') || !result.hasOwnProperty('size') || !result.hasOwnProperty('initial')){
            response.statusCode = 400;
            response.end(JSON.stringify({"error": "Bad Arguments!"}));
        }
        else if (result.nick == ""){
            response.statusCode = 400;
            response.end(JSON.stringify({"error": "You must authenticate to play"}));
        }
        else if (result.size < 3 || result.size > 6){
            response.statusCode = 400;
            response.end(JSON.stringify({"error": "Invalid board size"}));
        }
        else if (result.initial < 3 || result.initial > 6){
            response.statusCode = 400;
            response.end(JSON.stringify({"error": "Invalid seed number"}));
        }
        else{
            fs.readFile('data/groups.json',function(err, data){
                if(!findIfPlayerIsInGame(result.nick,response,data)){
                    joinGame(result,response,data, updater);
                }
            });
        }
    });
}


function joinGame(result,response,data, updater){
    let parsedData = JSON.parse(data);
    
    authenticateUser(result.nick, result.password, response, auth => {
        if (auth == true){
            let found = parsedData.group.filter(
                function(obj){ return obj.p2 == "" && obj.size == result.size && obj.initial == result.initial}
            );
            if (found.length == 0){
                const game = crypto.createHash('md5').update('game').digest('hex');
                newGame(game,result);
                response.statusCode = 200;
                response.end(JSON.stringify({"game":game}));
            }
            else{
                addPlayerToGame(found[0],result.nick,updater);
                response.statusCode = 200;
                response.end(JSON.stringify({"game":found[0].game}));
                setTimeout(function() {
                updater.update_game(found[0].game,JSON.stringify(board));},1000);
            }
            setTimeout(function() {
                removePlayerIfMatched(result.nick,updater);
                    }, 10000);
        }
    });
}

function newGame(game, result){
    fs.readFile('data/groups.json',function(err, data){
        var obj = JSON.parse(data);
        obj['group'].push({"game":game, "p1":result.nick, "p2":'', "size": result.size, "initial": result.initial});

        fs.writeFile('data/groups.json',JSON.stringify(obj),function(err){
        })
    });
}

function addPlayerToGame(found, newplayer,updater){
    fs.readFile('data/groups.json',function(err, data){
        var obj = JSON.parse(data);
        var chosenGame = obj['group'].filter(
            function(obj){
                return obj.game == found.game;
            });
        var newobj = obj['group'].filter(
            function(obj){
                return obj.game != found.game;
            });
        chosenGame[0].p2 = newplayer;
        newobj.push(chosenGame[0]);

        fs.writeFile('data/groups.json',JSON.stringify({"group":newobj}),function(err){
        })
        createBoard(chosenGame[0].size,chosenGame[0].initial,chosenGame[0].p1,chosenGame[0].p2,chosenGame[0].game,updater);
    });
}

function findIfPlayerIsInGame(player,response,data){
    var obj = JSON.parse(data);
    var newobj = obj['group'].filter(
        function(obj){
            return obj.p1 == player || obj.p2 == player;
        });

    if (newobj.length > 0){
        response.statusCode = 400;
        response.end(JSON.stringify({"error": "Player is already in a game!"}));
        return true;
    }
    return false;
}

function verifyIfPlayerInGame(player,response,data,game, updater){
    var obj = JSON.parse(data);
    var newobj = obj['group'].filter(
        function(obj){
            return (obj.p1 == player || obj.p2 == player) && obj.game == game;
        });
    if (newobj.length == 0){
        response.statusCode = 400;
        response.end(JSON.stringify({"error": "Player is not in designated game!"}));
        return false;
    }
    else {
        if (newobj[0].p1 != "" && newobj[0].p2 != ""){
            if (newobj[0].p1 != player){
                updater.update_game(newobj[0].game,JSON.stringify({"winner": newobj[0].p1}));
            }
            else updater.update_game(newobj[0].game,JSON.stringify({"winner": newobj[0].p2}));
        }
        else updater.update_game(newobj[0].game,JSON.stringify({"winner": ""}));
        return true;
    }
}

function removePlayerIfMatched(player,updater){
    fs.readFile('data/groups.json',function(err, data){
        var obj = JSON.parse(data);

        var newobj = obj['group'].filter(
            function(obj){
                return obj.p1 == player;
            });
        if (newobj.length >0 && newobj[0].p2 == ""){
            removePlayer(player);
            updater.update_player(player,JSON.stringify({"winner":""}));
        }
        var newobj1 = obj['group'].filter(
            function(obj){
                return obj.p2 == player;
            });
        if (newobj1.length > 0 && newobj1[0].p1 == ""){
            removePlayer(player);
            updater.update_player(player,JSON.stringify({"winner":""}));
        }
    });
}

function removePlayer(player){
    fs.readFile('data/groups.json',function(err, data){
        var obj = JSON.parse(data);
        var newobj = obj['group'].filter(
            function(obj){
                return obj.p1 != player && obj.p2 != player;
            });
        fs.writeFile('data/groups.json',JSON.stringify({"group":newobj}),function(err){
        })
    });
}

function getRequestBody(request, callback){
    let body = '';
    request.on('data', chunk => {
        body += chunk.toString();
    });
    request.on('end', () => {
        callback(JSON.parse(body));
    });
}

function createBoard(seed_num, side_num, p1, p2,game,updater){
    let side = [];
    for (let i = 0; i < side_num; i++){
        side.push(seed_num);
    }
    board = {"board": {"turn" : p1,"sides": {[p1]: {"store": 0, "pits": side},[p2]: {"store": 0, "pits": side}}},"stores": {[p1]:0,[p2]:0}};
}