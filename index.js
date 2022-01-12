const http = require('http');
const path = require('path');
const url  = require('url');
const fs   = require('fs');
const conf = require('./conf.js'); 
const crypto = require('crypto');
const { Console } = require('console');

http.createServer((request,response) => {
    switch(request.method) {
        case 'GET':
            doGetRequest(request,response);
            break;
        case 'POST':
            switch(request.url){
                case '/ranking':
                    response.setHeader('Content-Type', 'application/json');
                    getRankingList(response);
                    break;
                case '/register':
                    response.setHeader('Content-Type', 'application/json');
                    register(request,response);
                    break;
                case '/join':
                    response.setHeader('Content-Type', 'application/json');
                    join(request,response);
                    break;
                case '/leave':
                    response.setHeader('Content-Type', 'application/json');
                    leave(request,response);
                    break;
                default:
                    break;
            }
            break;
        default:
            response.writeHead(501); // 501 Not Implemented
            response.end();    
    }
}).listen(conf.port);

function doGetRequest(request,response) {
    const pathname = getPathname(request);
    if(pathname === null) {
        response.writeHead(404); // Forbidden
        response.end();
    } else 
        fs.stat(pathname,(err,stats) => {
            if(err) {
                response.writeHead(500); // Internal Server Error
                response.end();
            } else if(stats.isDirectory()) {
                if(pathname.endsWith(path.sep)){
                   doGetPathname(pathname+conf.defaultIndex,response);
                }
                else {
                   response.writeHead(301, // Moved Permanently
                                      {'Location': pathname+'/' });
                   response.end();
                }
            } else 
                doGetPathname(pathname,response);
       });    
}

function getPathname(request) {
    const purl = url.parse(request.url); 

    const documentRoot = path.resolve(conf.documentRoot);
    
    let pathname = path.normalize(documentRoot+purl.pathname);

    return pathname;
}


function doGetPathname(pathname,response) {
    const mediaType = getMediaType(pathname);
    const encoding = isText(mediaType) ? "utf8" : null;

    fs.readFile(pathname,encoding,(err,data) => {
    if(err) {
        response.writeHead(404); // Not Found
        response.end();
    } else {
        response.writeHead(200, { 'Content-Type': mediaType });
        response.end(data);
    }
  });    
}

function getMediaType(pathname) {
    const pos = pathname.lastIndexOf('.');
    let mediaType;

    if(pos !== -1) 
       mediaType = conf.mediaTypes[pathname.substring(pos+1)];

    if(mediaType === undefined)
       mediaType = 'text/plain';
    return mediaType;
}

function isText(mediaType) {
    if(mediaType.startsWith('image'))
      return false;
    else
      return true;
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

function register(request, response){
    getRequestBody(request, result => {
        if (!result.hasOwnProperty('nick') || !result.hasOwnProperty('password')){
            response.statusCode = 400;
            response.end(JSON.stringify({"error": "Bad Arguments!"}));
            console.log("1");
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


function getRankingList(res){
    fs.readFile('data/ranking.json',function(err, data){
        res.statusCode = 200;
        res.end(JSON.stringify(JSON.parse(data)));
    });
}

function leave(request, response){
    getRequestBody(request, result => {
        if (!result.hasOwnProperty('nick') || !result.hasOwnProperty('password') || !result.hasOwnProperty('game')){
            response.statusCode = 400;
            response.end(JSON.stringify({"error": "Bad Arguments!"}));     
        }
        else{
            authenticateUser(result.nick, result.password, response, auth => {
                if (auth == true){
                    fs.readFile('data/groups.json',function(err, data){
                        if(verifyIfPlayerInGame(result.nick,response,data,result.game)){
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

function join(request, response){
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
                    joinGame(result,response,data);
                }
            });
        }
    });
}

function joinGame(result,response,data){
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
                addPlayerToGame(found[0],result.nick);
                response.statusCode = 200;
                response.end(JSON.stringify({"game":found[0].game}));
            }
            setTimeout(function() {
                removePlayerIfMatched(result.nick);
                //notify should be called here!
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

function addPlayerToGame(found, newplayer){
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

function verifyIfPlayerInGame(player,response,data,game){
    var obj = JSON.parse(data);
    var newobj = obj['group'].filter(
        function(obj){
            return (obj.p1 == player || obj.p2 == player) && obj.game == game;
        });
    console.log(newobj);
    if (newobj.length == 0){
        response.statusCode = 400;
        response.end(JSON.stringify({"error": "Player is not in designated game!"}));
        return false;
    }
    else return true;
}

function removePlayerIfMatched(player){
    fs.readFile('data/groups.json',function(err, data){
        var obj = JSON.parse(data);

        var newobj = obj['group'].filter(
            function(obj){
                return obj.p1 == player;
            });
        if (newobj.length >0 && newobj[0].p2 == ""){
            removePlayer(player);
        }
        var newobj1 = obj['group'].filter(
            function(obj){
                return obj.p2 == player;
            });
        if (newobj1.length > 0 && newobj1[0].p1 == ""){
            removePlayer(player);
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