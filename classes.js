class Cell {
    constructor(seed_num, index, side){
        this.seed_num = seed_num;
        this.index = index;
        this.side = side;
    }

    get_seed_num(){
        return this.seed_num;
    }
    get_index(){
        return this.index;
    }
    get_side(){
        return this.side;
    }

    set_seed_num(seed_num){
        this.seed_num = seed_num;
    }
    set_index(index){
        this.index = index;
    }
    set_side(side){
        this.side = side;
    }

    insert_seeds(n){
        this.set_seed_num(this.get_seed_num() + n);
    }
}

class Row {
    constructor(cells){
        this.cells = cells;
    }

    get_cells(){
        return this.cells;
    }
    get_cell(i){
        return this.cells[i];
    }
    get_storage(){
        return this.cells[this.cells.length - 1];
    }

    set_cells(cells){
        this.cells = cells;
    }
    set_cell(i, cell){
        this.cells[i] = cell;
    }
    set_storage(storage){
        this.storage = storage;
    }
}

class Storage extends Cell{
    constructor(seed_num, index, side){
        super(seed_num, index, side);
    }
}

class Board {
    constructor(p1_row, p2_row){
        this.p1_row = p1_row;
        this.p2_row = p2_row;
    }

    get_p1_row(){
        return this.p1_row;
    }
    get_p2_row(){
        return this.p2_row;
    }

    set_p1_row(p1_row){
        this.p1_row = p1_row;
    }
    set_p2_row(p2_row){
        this.p2_row = p2_row;
    }
}

function create_board(cell_number, seed_number){
    player1_storage = new Storage(0, Number(cell_number), 1);
    player2_storage = new Storage(0, Number(cell_number), 2);

    player1_cells = [];
    player2_cells = [];
    for (i = 0; i < cell_number; i++){
        player1_cells[i] = new Cell(Number(seed_number), i, 1);
        player2_cells[i] = new Cell(Number(seed_number), i, 2);
    }
    player1_cells.push(player1_storage);
    player2_cells.push(player2_storage);

    player1_row = new Row(player1_cells);
    player2_row = new Row(player2_cells);

    board = new Board(player1_row, player2_row);

    return board;
}

function change_player(current_player){
    if (current_player == 1) return 2;
    return 1;
}

function sow(board, index, player){
    let cell;
    const storage_index = board.get_p1_row().get_cells().length - 1;
    switch (player) {  
        case 1:
            cell = board.get_p1_row().get_cell(index);
            break;
        case 2:
            cell = board.get_p2_row().get_cell(index);
            break;
        default:
            break;
    }
    let total_seeds = cell.get_seed_num();
    let current_player = player;
    let current_index = index;
    cell.set_seed_num(0);
    let current_cell;
    for (i = 1; i <= total_seeds; i++){

        if (current_index == storage_index){
            current_player = change_player(current_player);
            current_index = 0;
        } else current_index++;
        if ((current_index == storage_index) && (current_player != player)){
            current_index = 0;
            current_player = change_player(current_player);
        }

        if (current_player == 1){
            current_cell = board.get_p1_row().get_cell(current_index);
        } else {
            current_cell = board.get_p2_row().get_cell(current_index);
        }
        current_cell.insert_seeds(1);
    }
    check_last_seed(board, current_cell, player)
    drawBoard(board);
}

function check_last_seed(board, cell, player){
    const length = board.get_p1_row().get_storage().get_index();
    if (cell.get_seed_num() == 1 && cell.get_side() == player && cell.get_index() != length){
        const cell_index = cell.get_index()
        let storage, opposite;
        switch (player) {  
            case 1:
                storage = board.get_p1_row().get_storage();
                opposite = board.get_p2_row().get_cell(length - 1 - cell_index);
                break;
            case 2:
                storage = board.get_p2_row().get_storage();
                opposite = board.get_p1_row().get_cell(length - 1 - cell_index);
                break;
            default:
                break;
        }
        transfer_to_storage(cell, storage);
        transfer_to_storage(opposite, storage);
    }
}

function transfer_to_storage(cell, storage){
    let seeds = cell.get_seed_num();
    cell.set_seed_num(0);
    storage.insert_seeds(seeds);
}
