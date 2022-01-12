var player = 1;
var first_player_computer = false;
var mode = 0;

function enableDisableComputerLvl(val){
    const form = document.getElementById("basic");
    form.disabled = val;
    const form1 = document.getElementById("advanced");
    form1.disabled = val;
}

function versusPlayer(){
    começar.addEventListener('click', join);
    mode = 0;
    const begin = document.getElementById("begin");
    begin.disabled = false;

    const button = document.getElementById("vs-player");
    button.style.background = '#ffffff';
    const button3 = document.getElementById("vs-computer");
    button3.style.background = '#ccccc9';
    const button1 = document.getElementById("player-1");
    button1.disabled = true;
    const button2 = document.getElementById("computer-1");
    button2.disabled = true;
    enableDisableComputerLvl(true);
}

function versusComputer(){
    mode = 1;
    começar.removeEventListener('click', join);
    const begin = document.getElementById("begin");
    begin.disabled = false;
    const button = document.getElementById("vs-computer");
    button.style.background = '#ffffff';
    const button3 = document.getElementById("vs-player");
    button3.style.background = '#ccccc9';
    const button1 = document.getElementById("player-1");
    button1.disabled = false;
    const button2 = document.getElementById("computer-1");
    button2.disabled = false;
    enableDisableComputerLvl(false);
}

function p1Player(){
    const button = document.getElementById("player-1");
    button.style.background = '#ffffff';
    const button3 = document.getElementById("computer-1");
    button3.style.background = '#ccccc9';
    first_player_computer = false;
}

function p1Computer(){
    const button = document.getElementById("computer-1")
    button.style.background = '#ffffff';
    const button3 = document.getElementById("player-1")
    button3.style.background = '#ccccc9';
    first_player_computer = true;
}

function giveUp(){
    const button = document.getElementById("begin")
    button.disabled = true;
    activateAllSettings();
    makeAllButtonsGrey();
}

function makeAllButtonsGrey(){
    const button3 = document.getElementById("vs-player");
    button3.style.background = '#ccccc9';
    const button5 = document.getElementById("computer-1");
    button5.style.background = '#ccccc9';
    const button4 = document.getElementById("player-1")
    button4.style.background = '#ccccc9';
    const button6 = document.getElementById("vs-computer");
    button6.style.background = '#ccccc9';
}

function onloadSettings(){
    const button = document.getElementById("begin")
    button.disabled = true;
    activateAllSettings();

    if (localStorage.getItem('computer') == null){
        localStorage.setItem('computer',0);
    }
    if (localStorage.getItem('player') == null){
        localStorage.setItem('player',0);
    }

}

//key should be either 'computer' or 'player'
function increaseWins(key){
    localStorage.setItem(key,parseInt(localStorage.getItem(key))+1);
}

function activateAllSettings(){
    const buttonGiveUp = document.getElementById("give-up")
    buttonGiveUp.disabled = true;
    const dropDown1 = document.getElementById("cavidades")
    dropDown1.disabled = false;
    const dropDown2 = document.getElementById("sementes")
    dropDown2.disabled = false;
    const button1 = document.getElementById("player-1")
    button1.disabled = false;
    const button2 = document.getElementById("computer-1")
    button2.disabled = false;
    enableDisableComputerLvl(false);
    const button4 = document.getElementById("vs-computer")
    button4.disabled = false;
    const button5 = document.getElementById("vs-player")
    button5.disabled = false;
}

function disableAllSettings(){
    if (document.contains(document.getElementById("board-container"))) {
        document.getElementById("board-container").remove();} 
    if (document.contains(document.getElementById("turn"))) {
            document.getElementById("turn").remove();}
    const button = document.getElementById("begin")
    button.disabled = true;
    const buttonGiveUp = document.getElementById("give-up")
    buttonGiveUp.disabled = false;
    const dropDown1 = document.getElementById("cavidades")
    dropDown1.disabled = true;
    const dropDown2 = document.getElementById("sementes")
    dropDown2.disabled = true;
    enableDisableComputerLvl(true);
    const button1 = document.getElementById("player-1")
    button1.disabled = true;
    const button2 = document.getElementById("computer-1")
    button2.disabled = true;
    const button4 = document.getElementById("vs-computer")
    button4.disabled = true;
    const button5 = document.getElementById("vs-player")
    button5.disabled = true;
}

function join_warning(text){
    if (document.contains(document.getElementById("beg_warning"))) {
        document.getElementById("beg_warning").remove();
    }   
    var settings = document.getElementById("settings");
    const warning = document.createElement("DIV");
    warning.id = "beg_warning";
    warning.classList.add("warning");
    warning.appendChild(document.createTextNode(text));
    settings.appendChild(warning);
}

function begin_server(){
    waitMessage();
    disableAllSettings();
}

function begin(){
    if (mode == 1){
        disableAllSettings();
        drawInitialBoard();
    }
}

function getFormResult(id){
    const element = document.getElementById(id);
    return element.options[element.selectedIndex].value;
}

function removeElementsById(id){
    let elem = document.getElementById(id);
    while(elem != null){
        elem.remove();
        elem = document.getElementById(id);
    }
}

function removeElementsByClass(className){
    let elem = document.getElementsByClassName(className);
    while(elem.length > 0){
        elem[0].parentNode.removeChild(elem[0]);
    }
}

function stylizeSeed(seed){
    let angle = Math.random()*360;
    seed.style.transform = `rotate(${angle}deg)`; 
}

function insertSeeds(cell, seedNum){
    for (let j = 0; j < seedNum; j++){
        const seed = document.createElement("IMG");
        seed.className = "seed";
        seed.src = "peca.png";
        seed.alt = "peça";
        stylizeSeed(seed);
        cell.appendChild(seed);
    }
}

function announceWinner(winner){
    const finalMessage = document.createElement("DIV");
    let finalMessageText;
    const container = document.getElementById("right-container");

    finalMessage.id = "final-message";

    removeElementsById(finalMessage.id);

    switch (winner){
        case 1:
            finalMessageText = document.createTextNode("player 1 wins");
            break;
        case 2:
            finalMessageText = document.createTextNode("player 2 wins");
            break;
        default:
            finalMessageText = document.createTextNode("it's a tie");
            break;
    }

    finalMessage.appendChild(finalMessageText);
    container.appendChild(finalMessage);
}

function gameOver(topCells, bottomCells){
    const topCellsPlayer = Number(topCells.firstChild.id[1]), bottomCellsPlayer = Number(bottomCells.firstChild.id[1]);
    let seeds = 0, storage = document.getElementById("p" + topCellsPlayer + "-storage");
    
    for(cell = topCells.firstChild; cell !== null; cell = cell.nextSibling){
        transferToStorage(cell, storage);
    }

    seeds = 0;
    storage = document.getElementById("p" + bottomCellsPlayer + "-storage");

    for(cell = bottomCells.firstChild; cell !== null; cell = cell.nextSibling){
        transferToStorage(cell, storage);
    }

    checkWinner();
}

function insertStorage(board, storage){
    let seedNum;
    if (storage.id == "p1-storage"){
        seedNum = board.get_p1_row().get_storage().get_seed_num();
    } else {
        seedNum = board.get_p2_row().get_storage().get_seed_num();
    }
    insertSeeds(storage, seedNum);
}

function insertCells(board, cells){
    const cavityNum = board.get_p1_row().get_length();

    const topCells = document.createElement("DIV");
    const bottomCells = document.createElement("DIV");

    topCells.id = "top-cells";
    topCells.className = "cell-row";
    bottomCells.id = "bottom-cells";
    bottomCells.className = "cell-row";

    let possibleMoves = [];

    for (i = 0; i < cavityNum; i++){
        const p2Index = i;
        const cellElem = document.createElement("DIV");
        cellElem.id = "p2-" + i;
        cellElem.className = "cell";

        let seedNum = board.get_p2_row().get_cell(i).get_seed_num();

        insertSeeds(cellElem, seedNum);

        if (seedNum > 0 && player == 2 && first_player_computer) cellElem.addEventListener("click", 
        function(){
            sow(board, i, player);
            board.check_game_over();
        });
        else if (seedNum > 0 && player == 2 && !first_player_computer){
            possibleMoves.push(p2Index);
        }
        topCells.appendChild(cellElem);
    }
    cells.appendChild(topCells);

    for (i = 0; i < cavityNum; i++){
        const p1Index = i;
        const cellElem = document.createElement("DIV");
        cellElem.id = "p1-" + i;
        cellElem.className = "cell";

        let seedNum = board.get_p1_row().get_cell(i).get_seed_num();

        insertSeeds(cellElem, seedNum);

        if (seedNum > 0 && player == 1 && !first_player_computer) cellElem.addEventListener("click", 
        function(){
            sow(board, p1Index, player);
            board.check_game_over();
        });
        else if (seedNum > 0 && player == 1 && first_player_computer){
            possibleMoves.push(p1Index);
        }
        bottomCells.appendChild(cellElem);
    }
    cells.appendChild(bottomCells);

    if ((player == 1 && first_player_computer) || (player == 2 && !first_player_computer)){
        computer_lvl_1(board,possibleMoves);
    }
}

function drawBoard(board){
    const container = document.createElement("SPAN");
    const boardElem = document.createElement("DIV");
    const player2Storage = document.createElement("DIV");
    const player1Storage = document.createElement("DIV");
    const cells = document.createElement("DIV");
    
    container.id = "board-container";
    boardElem.id = "board";

    player2Storage.id = "p2-storage";
    player2Storage.className = "storage";
    player1Storage.id = "p1-storage";
    player1Storage.className = "storage";

    cells.id = "cells";

    removeElementsById("board-container");

    insertStorage(board, player2Storage);
    insertCells(board, cells);
    insertStorage(board, player1Storage);

    boardElem.appendChild(player2Storage);
    boardElem.appendChild(cells);
    boardElem.appendChild(player1Storage);
    container.appendChild(boardElem);
    document.getElementById("right-container").appendChild(container);

    var board = document.getElementById("board-container");
    board.style.display = "flex";
    
}

function drawInitialBoard(){
    let cavityNum = getFormResult("cavidades");
    let seedNum = getFormResult("sementes");

    let board = create_board(cavityNum, seedNum);

    drawBoard(board);
}

function waitMessage(){
    var waitMessagePopUp = document.getElementById("wait-message");
    waitMessagePopUp.style.display = "block";
}

function removeWaitMessage(){
    var waitMessagePopUp = document.getElementById("wait-message");
    waitMessagePopUp.style.display = "none";
}

function timeOutMessage(){
    var timeoutMessagePopUp = document.getElementById("timeout");
    timeoutMessagePopUp.style.display = "block";
}

function removeTimeOutMessage(){
    var timeoutMessagePopUp = document.getElementById("timeout");
    timeoutMessagePopUp.style.display = "none";
}

function logOut(){
    var b_auth = document.getElementById("bef-auth");
    var a_auth = document.getElementById("pos-auth");
    b_auth.style.display = "block";
    a_auth.style.display = "none";
    document.getElementById('nome').value = "";
    document.getElementById('password').value = "";
    var auth_button = document.getElementById("register");
    auth_button.style.display = "block"; 
    player_nick = "";

    if (document.contains(document.getElementById("auth-warning"))) {
        document.getElementById("auth-warning").remove();}   
    if (document.contains(document.getElementById("player-nic"))) {
         document.getElementById("player-nic").remove();}   
}




