function enableDisableComputerLvl(val){
    const form = document.getElementById("1");
    form.disabled = val;
    const form1 = document.getElementById("2");
    form1.disabled = val;
    const form2 = document.getElementById("3");
    form2.disabled = val;
    const form3 = document.getElementById("4");
    form3.disabled = val;
    const form4 = document.getElementById("5");
    form4.disabled = val;
}

function versusPlayer(){
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
}

function p1Computer(){
    const button = document.getElementById("computer-1")
    button.style.background = '#ffffff';
    const button3 = document.getElementById("player-1")
    button3.style.background = '#ccccc9';
}

function giveUp(){
    const button = document.getElementById("begin")
    button.disabled = false;
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

function begin(){
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
    
    var board = document.getElementById("board-container");
    board.style.display = "flex";
}

function getFormResult(id){
    const element = document.getElementById(id);
    return element.options[element.selectedIndex].value;
}

function removeElements(id){
    let elem = document.getElementById(id);
    while(elem != null){
        elem.remove();
        elem = document.getElementById(id);
    }
}

function stylizeSeed(seed){
    let angle = Math.random()*360;
    seed.style.transform = `rotate(${angle}deg)`; 
}

function insertSeeds(cell, seedNum){
    for (let j = 0; j < seedNum; j++){
        const seed = document.createElement("DIV");
        seed.className = "seed";
        const t = document.createTextNode("S ");
        seed.appendChild(t);
        stylizeSeed(seed);
        cell.appendChild(seed);
    }
}

function transferToStorage(cell, storage){
    let totalSeeds = cell.childNodes.length, seeds = 0;
    for (i = 0; i < totalSeeds; i++){
        cell.removeChild(cell.childNodes[0]);
        seeds++;
    }
    insertSeeds(storage, seeds);
}

function changePlayer(currPlayer){
    if (currPlayer == 1) return 2;
    return 1;
}

function checkWinner(){
    const player1StorageSeeds = document.getElementById("p1-storage").childNodes.length
    const player2StorageSeeds = document.getElementById("p2-storage").childNodes.length;
    const finalMessage = document.createElement("DIV");
    const container = document.getElementById("right-container");
    let winner;

    finalMessage.id = "final-message";

    removeElements(finalMessage.id);

    if (player1StorageSeeds > player2StorageSeeds) winner = document.createTextNode("player 1 wins");
    else if (player1StorageSeeds < player2StorageSeeds) winner = document.createTextNode("player 2 wins");
    else winner = document.createTextNode("it's a tie");

    finalMessage.appendChild(winner);
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

function checkGameOver(topCells, bottomCells){
    let gameOverTopCells = true, gameOverBottomCells = true;
    for(cell = topCells.firstChild; cell !== null; cell = cell.nextSibling){
        if (cell.childNodes.length != 0) gameOverTopCells = false;
    }
    for(cell = bottomCells.firstChild; cell !== null; cell = cell.nextSibling){
        if (cell.childNodes.length != 0) gameOverBottomCells = false;
    }
    return gameOverTopCells || gameOverBottomCells;
}

function checkLastSeed(player, cell, cellIndex, cavityNum){
    const storage = document.getElementById("p" + player + "-storage");
    if (cellIndex != "storage" && cell.id == "p" + player + "-" + cellIndex && cell.childNodes.length == 1){
        transferToStorage(cell, storage);
        let opposite = document.getElementById("p" + changePlayer(player) + "-" + (cavityNum - cellIndex - 1));
        console.log(opposite);
        transferToStorage(opposite, storage);
    }
}

function insertCells(cells, cavityNum, seedNum){
    const topCells = document.createElement("DIV");
    const bottomCells = document.createElement("DIV");

    topCells.id = "top-cells";
    topCells.className = "cell-row";
    bottomCells.id = "bottom-cells";
    bottomCells.className = "cell-row";

    for (i = 0; i < cavityNum; i++){
        const cell = document.createElement("DIV");
        cell.id = "p2-" + (cavityNum - 1 - i);
        cell.classList.add("border", "cell");
        insertSeeds(cell, seedNum);

        cell.addEventListener("click", 
        function(){
            sow(i, cavityNum);
        });
        topCells.appendChild(cell);
    }
    cells.appendChild(topCells);

    for (i = 0; i < cavityNum; i++){
        const cell = document.createElement("DIV");
        cell.id = "p1-" + i;
        cell.classList.add("border", "cell");
        insertSeeds(cell, seedNum);
        cell.addEventListener("click", 
        function(){

        });
        bottomCells.appendChild(cell);
    }
    cells.appendChild(bottomCells);
}

function viewBoard(){
    const cavityNumber = getFormResult("cavidades");
    const seedNumber = getFormResult("sementes");

    create_board(cavityNumber, seedNumber);

    const container = document.createElement("SPAN");
    const board = document.createElement("DIV");
    const player2Storage = document.createElement("DIV");
    const player1Storage = document.createElement("DIV");
    const cells = document.createElement("DIV");
    
    container.id = "board-container";
    board.id = "board";
    board.className = "border";

    player2Storage.id = "p2-storage";
    player2Storage.classList.add("border", "storage");
    player1Storage.id = "p1-storage";
    player1Storage.classList.add("border", "storage");

    cells.id = "cells";
    

    removeElements("board-container");

    insertCells(cells, cavityNumber, seedNumber);

    board.appendChild(player2Storage);
    board.appendChild(cells);
    board.appendChild(player1Storage);
    container.appendChild(board);
    document.getElementById("right-container").appendChild(container);
}