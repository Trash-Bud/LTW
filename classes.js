class Cell {
    constructor(seed_num, index){
        this.seed_num = seed_num;
        this.index = index;
    }

    get_seed_num(){
        return this.seed_num;
    }
    get_index(){
        return this.index;
    }

    set_seed_num(seed_num){
        this.seed_num = seed_num;
    }
    set_index(index){
        this.index = index;
    }
}

class Row {
    constructor(cells){
        this.cells = cells;
    }

    get_cells(){
        return this.cells;
    }

    set_cells(cells){
        this.cells = cells;
    }
}

class Storage extends Cell{
    constructor(seed_num, index){
        super(seed_num, index);
    }

    get_index(){
        return this.index;
    }

    set_index(index){
        this.index = index;
    }
}

class Board {
    constructor(p1_row, p1_storage, p2_row, p2_storage){
        this.p1_row = p1_row;
        this.p1_storage = p1_storage;
        this.p2_row = p2_row;
        this.p2_storage = p2_storage;
    }

    get_p1_row(){
        return this.p1_row;
    }
    get_p1_storage(){
        return this.p1_storage;
    }
    get_p2_row(){
        return this.p2_row;
    }
    get_p2_storage(){
        return this.p2_storage;
    }

    set_p1_row(p1_row){
        this.p1_row = p1_row;
    }
    set_p1_storage(p1_storage){
        this.p1_storage = p1_storage;
    }
    set_p2_row(p2_row){
        this.p2_row = p2_row;
    }
    set_p2_storage(p2_storage){
        this.p2_storage = p2_storage;
    }
}

function create_board(cell_number, seed_number){
    player1_storage = new Storage(0, Number(cell_number));
    player2_storage = new Storage(0, Number(cell_number));

    player1_cells = [];
    player2_cells = [];
    for (i = 0; i < cell_number; i++){
        player1_cells[i] = new Cell(Number(seed_number), i);
        player2_cells[i] = new Cell(Number(seed_number), i);
    }
    player1_row = new Row(player1_cells);
    player2_row = new Row(player2_cells);

    board = new Board(player1_row, player1_storage, player2_row, player2_storage);

    console.log(board);
}

function sow(index, cavityNum){
    console.log(index);
    let total_seeds = cell.get_seed_num();
    let current_seeds = 0;

    /* let totalSeeds = cell.childNodes.length;
    let currSeeds = 0;
    let currPlayer = player;
    let cellIndex = Number(cell.id[3]);
    for (n = 0; n < totalSeeds; n++){
        cell.removeChild(cell.childNodes[0]);
        currSeeds++;
    }
    for (n = 1; n <= currSeeds; n++){
        if (cellIndex == "storage"){
            currPlayer = changePlayer(currPlayer);
            cellIndex = 0;
        } else cellIndex++;
        if (cellIndex >= Number(cavityNum)){
            if (currPlayer == player) cellIndex = "storage";
            else {
                cellIndex = 0;
                currPlayer = changePlayer(currPlayer);
            }
        }
        nCell = document.getElementById("p" + currPlayer + "-" + cellIndex);
        insertSeeds(nCell, 1);
        // await new Promise(r => setTimeout(r, 300));
        if (n == currSeeds) checkLastSeed(player, nCell, cellIndex, cavityNum);
    }*/
}
