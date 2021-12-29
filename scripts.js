function enable_disable_computer_lvl(val){
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

function versus_player(){
    const button = document.getElementById("vs-player");
    button.style.background = '#ffffff';
    const button3 = document.getElementById("vs-computer");
    button3.style.background = '#ccccc9';
    const button1 = document.getElementById("player-1");
    button1.disabled = true;
    const button2 = document.getElementById("computer-1");
    button2.disabled = true;
    enable_disable_computer_lvl(true);
}

function versus_computer(){
    const button = document.getElementById("vs-computer");
    button.style.background = '#ffffff';
    const button3 = document.getElementById("vs-player");
    button3.style.background = '#ccccc9';
    const button1 = document.getElementById("player-1");
    button1.disabled = false;
    const button2 = document.getElementById("computer-1");
    button2.disabled = false;
    enable_disable_computer_lvl(false);
}

function p1_player(){
    const button = document.getElementById("player-1");
    button.style.background = '#ffffff';
    const button3 = document.getElementById("computer-1");
    button3.style.background = '#ccccc9';
}

function p1_computer(){
    const button = document.getElementById("computer-1")
    button.style.background = '#ffffff';
    const button3 = document.getElementById("player-1")
    button3.style.background = '#ccccc9';
}

function giveUp(){
    const button = document.getElementById("begin")
    button.disabled = false;
    const button_give_up = document.getElementById("give_up")
    button_give_up.disabled = true;
    const drop_down1 = document.getElementById("cavidades")
    drop_down1.disabled = false;
    const drop_down2 = document.getElementById("sementes")
    drop_down2.disabled = false;
    const button1 = document.getElementById("player-1")
    button1.disabled = false;
    const button2 = document.getElementById("computer-1")
    button2.disabled = false;
    enable_disable_computer_lvl(false);
    const button4 = document.getElementById("vs-computer")
    button4.disabled = false;
    const button5 = document.getElementById("vs-player")
    button5.disabled = false;
}

function begin(){
    const button = document.getElementById("begin")
    button.disabled = true;
    const button_give_up = document.getElementById("give_up")
    button_give_up.disabled = false;
    const drop_down1 = document.getElementById("cavidades")
    drop_down1.disabled = true;
    const drop_down2 = document.getElementById("sementes")
    drop_down2.disabled = true;
    enable_disable_computer_lvl(true);
    const button1 = document.getElementById("player-1")
    button1.disabled = true;
    const button2 = document.getElementById("computer-1")
    button2.disabled = true;
    const button4 = document.getElementById("vs-computer")
    button4.disabled = true;
    const button5 = document.getElementById("vs-player")
    button5.disabled = true;
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

function insertCells(row, cavityNum, seedNum){
    for (i = 0; i < cavityNum; i++){
        const cell = document.createElement("DIV");
        cell.classList.add("border", "cell");
        insertSeeds(cell, seedNum);
        if (row.id == "bottom-cells") {
            console.log(cell.id);
            // cell.onclick = 
        }
        row.appendChild(cell);
    }
}

function createBoard(){
    const cavityNumber = getFormResult("cavidades");
    const seedNumber = getFormResult("sementes");

    const container = document.createElement("SPAN");
    const board = document.createElement("DIV");
    const player2Storage = document.createElement("DIV");
    const player1Storage = document.createElement("DIV");
    const cells = document.createElement("DIV");
    const topCells = document.createElement("DIV");
    const bottomCells = document.createElement("DIV");
    
    container.id = "board-container";
    board.id = "board";
    board.className = "border";

    player2Storage.id = "player-2-storage";
    player2Storage.classList.add("border", "storage");
    player1Storage.id = "player-1-storage";
    player1Storage.classList.add("border", "storage");

    cells.id = "cells";

    topCells.id = "top-cells";
    topCells.className = "cell-row";
    bottomCells.id = "bottom-cells";
    bottomCells.className = "cell-row";

    

    removeElements("board-container");

    insertCells(topCells, cavityNumber, seedNumber);
    insertCells(bottomCells, cavityNumber, seedNumber);

    cells.appendChild(topCells);
    cells.appendChild(bottomCells);

    board.appendChild(player2Storage);
    board.appendChild(cells);
    board.appendChild(player1Storage);
    container.appendChild(board);
    document.getElementById("right-container").appendChild(container);
}