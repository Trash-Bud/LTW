const http = require('http');
const path = require('path');
const url  = require('url');
const fs   = require('fs');
const conf = require('./conf.js'); 
const crypto = require('crypto');

http.createServer((request,response) => {
    console.log(request.url);
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
        console.log(result);
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
        console.log(obj);
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
        console.log(found);
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

function authenticateUser(nick, password, response){
    fs.readFile('data/users.json',function(err, data){
        var obj = JSON.parse(data).users;
        let found = obj.filter(
            function(obj){ return obj.nick == nick }
        );
        console.log(found);
        if (found.length == 0){
            response.statusCode = 401;
            response.end(JSON.stringify({"error": "No use found"}));
        }
        else{
            let hash1 = crypto.pbkdf2Sync(password, 
                found[0].salt, 1000, 64, `sha512`).toString(`hex`);
            if (found[0].password != hash1){
                response.statusCode = 401;
                response.end(JSON.stringify({"error": "User registered with a different password"}));
            }
        }
    });
}


function getRankingList(res){
    fs.readFile('data/ranking.json',function(err, data){
        res.statusCode = 200;
        res.end(JSON.stringify(JSON.parse(data)));
        console.log(err);
    });
}

function leave(request, response){
    
}

function join(request, response){
    fs.readFile('data/groups.json',function(err, data){
        let parsedData = JSON.parse(data);
        getRequestBody(request, result => {
            let found = parsedData.group.filter(
                function(obj){ return obj.p2 == "" && obj.size == result.size && obj.initial == result.initial}
            );
            authenticateUser(result.nick,result.password,response);
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
        });
    });
}

function newGame(game, result){
    fs.readFile('data/groups.json',function(err, data){
        var obj = JSON.parse(data);
        obj['group'].push({"game":game, "p1":result.nick, "p2":'', "size": result.size, "initial": result.initial});
        console.log(obj);
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
        console.log(obj);
        fs.writeFile('data/groups.json',JSON.stringify({"group":newobj}),function(err){
        })
    });

}