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
    console.log(board);
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

function sow(cells, cell, cavityNum){
    let totalSeeds = cell.childNodes.length;
    let currSeeds = 0;
    let currPlayer = 1;
    let cellIndex = Number(cell.id[3]);
    const initialIndex = Number(cell.id[3]);
    for (n = 0; n < totalSeeds; n++){
        cell.removeChild(cell.childNodes[0]);
        currSeeds++;
    }
    for (n = 1; n <= currSeeds; n++){
        cellIndex++;
        if (cellIndex >= cavityNum){
            if (currPlayer == 1) currPlayer = 2;
            else currPlayer = 1;
            cellIndex = 0;
        }
        nCell = document.getElementById("p" + currPlayer + "-" + cellIndex);
        insertSeeds(nCell, 1);
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
            sow(cells, cell, cavityNum); 
        });
        bottomCells.appendChild(cell);
    }
    cells.appendChild(bottomCells);
}

function createBoard(){
    const cavityNumber = getFormResult("cavidades");
    console.log(cavityNumber);
    const seedNumber = getFormResult("sementes");
    console.log(seedNumber);

    const container = document.createElement("SPAN");
    const board = document.createElement("DIV");
    const player2Storage = document.createElement("DIV");
    const player1Storage = document.createElement("DIV");
    const cells = document.createElement("DIV");
    
    container.id = "board-container";
    board.id = "board";
    board.className = "border";

    player2Storage.id = "player-2-storage";
    player2Storage.classList.add("border", "storage");
    player1Storage.id = "player-1-storage";
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