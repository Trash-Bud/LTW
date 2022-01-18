const http = require('http');
const conf = require('./conf.js'); 
let updater  = require('./updater.js');
const get  = require('./get.js');
let post  = require('./post.js');

http.createServer((request,response) => {
    switch(request.method) {
        case 'GET':
            if(request.url.startsWith('/update')){
                get.update(request,response,updater);
            }
            else{
                get.doGetRequest(request,response);
            }
            break;
        case 'POST':
            switch(request.url){
                case '/ranking':
                    response.setHeader('Content-Type', 'application/json');
                    post.ranking(response);
                    break;
                case '/register':
                    response.setHeader('Content-Type', 'application/json');
                    post.register(request,response);
                    break;
                case '/join':
                    response.setHeader('Content-Type', 'application/json');
                    post.join(request,response,updater);
                    break;
                case '/leave':
                    response.setHeader('Content-Type', 'application/json');
                    post.leave(request,response,updater);
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