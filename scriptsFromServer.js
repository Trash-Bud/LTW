var player1 = null, player2 = null;

function insertCellsFromServer(p1ServerInfo, p2ServerInfo, cells,end){
    const cavityNum = p1ServerInfo.length;
    const topCells = document.createElement("DIV");
    const bottomCells = document.createElement("DIV");

    topCells.id = "top-cells";
    topCells.className = "cell-row";
    bottomCells.id = "bottom-cells";
    bottomCells.className = "cell-row";


    for (let index in p2ServerInfo){
        const p2Index = index;
        const cellElem = document.createElement("DIV");
        cellElem.id = "p2-" + (cavityNum - 1 - index);
        cellElem.className = "cell";

        let seedNum = p2ServerInfo[cavityNum - 1 - index];
        insertSeeds(cellElem, seedNum);

        if (seedNum > 0 && player2 == player_nick && !end) {
            cellElem.addEventListener("click", function(){notify(cavityNum - 1 - p2Index)})
            cellElem.classList.add("playable_cell");
        };

        topCells.appendChild(cellElem);
    }
    cells.appendChild(topCells);

    for (let index = 0; index < p1ServerInfo.length; index++){
        const p1Index = index;
        const cellElem = document.createElement("DIV");
        cellElem.id = "p1-" + index;
        cellElem.className = "cell";

        let seedNum = p1ServerInfo[index];
        insertSeeds(cellElem, seedNum);

        if (seedNum > 0 && player1 == player_nick && !end) {
            cellElem.addEventListener("click", function(){notify(p1Index)})
            cellElem.classList.add("playable_cell");
        };

        bottomCells.appendChild(cellElem);
    }
    cells.appendChild(bottomCells);
}

function drawBoardFromServer(serverInfo, end){
    if (player1 == null && player2 == null){
        player1 = Object.keys(serverInfo.stores)[0]; 
        player2 = Object.keys(serverInfo.stores)[1];
        removeWaitMessage();
    }

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

    insertSeeds(player2Storage, serverInfo.board.sides[player2].store);
    insertCellsFromServer(serverInfo.board.sides[player1].pits, serverInfo.board.sides[player2].pits, cells, end);
    insertSeeds(player1Storage, serverInfo.board.sides[player1].store);

    boardElem.appendChild(player2Storage);
    boardElem.appendChild(cells);
    boardElem.appendChild(player1Storage);
    container.appendChild(boardElem);
    document.getElementById("right-container").appendChild(container);

    var board = document.getElementById("board-container");
    board.style.display = "flex";

    announcePlayerTurn(serverInfo);
}

function announcePlayerTurn(serverInfo){
    if (document.contains(document.getElementById("turn"))) {
        document.getElementById("turn").remove();} 
    
    if (document.contains(document.getElementById("warning"))) {
        document.getElementById("warning").remove();}

    const playerElem = document.createElement("DIV");
    playerElem.id = "turn";

    let playerText;

    if (serverInfo.hasOwnProperty("winner")) playerText = document.createTextNode(serverInfo.winner + " won the game");
    else {
        playerText = document.createTextNode(serverInfo.board.turn + "'s turn");
    }
    playerElem.appendChild(playerText);

    let container = document.getElementById("right-container");
    container.appendChild(playerElem);


}