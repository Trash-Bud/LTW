
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
    get_length(){
        return this.cells.length - 1;
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

    transfer_seeds(cell){
        let seeds = cell.get_seed_num();
        cell.set_seed_num(0);
        this.insert_seeds(seeds);
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

    check_game_over(){
        let gameOverTopCells = true, gameOverBottomCells = true;
        const length = this.p1_row.get_length();
        for(i = 0; i < length; i++){
            if (this.p1_row.get_cell(i).get_seed_num() > 0) gameOverTopCells = false;
        }
        for(i = 0; i < length; i++){
            if (this.p2_row.get_cell(i).get_seed_num() > 0) gameOverBottomCells = false;
        }
        return gameOverTopCells || gameOverBottomCells;
    }

    game_over(){
        let p1_storage = this.p1_row.get_storage(), p2_storage = this.p2_row.get_storage();
        for(i = 0; i < this.p1_row.get_length(); i++){
            p1_storage.transfer_seeds(this.p1_row.get_cell(i));
        }
        for(i = 0; i < this.p2_row.get_length(); i++){
            p2_storage.transfer_seeds(this.p2_row.get_cell(i));
        }

        const p1_score = p1_storage.get_seed_num();
        const p2_score = p2_storage.get_seed_num();

        let winner;
        if (p1_score > p2_score) winner = 1;
        else if (p1_score < p2_score) winner = 2;
        else winner = 0;

        if ((winner == 1 && first_player_computer) || (winner == 2 && !first_player_computer)){
            increaseWins('computer');
        }
        else if (winner != 0){
            increaseWins('player');
        }
        return winner;
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


function sow(board, index, current_player){
    let cell;
    const storage_index = board.get_p1_row().get_length();
    switch (current_player) {  
        case 1:
            cell = board.get_p1_row().get_cell(index);

            break;
        case 2:
            cell = board.get_p2_row().get_cell(index);
            
            break;
        default:
            break;
    }

    console.log(cell);
    let total_seeds = cell.get_seed_num();
    let current_board_side = current_player;
    let current_index = index;

    if (total_seeds == 1){ 
        check_cell(board, cell, current_player); 
    }
    else {
        let current_cell;
        cell.set_seed_num(0);
        for (i = 1; i <= total_seeds; i++){

            if (current_index == storage_index){
                current_board_side = change_player(current_board_side);
                current_index = 0;
            } else current_index++;
            if ((current_index == storage_index) && (current_board_side != current_player)){
                current_index = 0;
                current_board_side = change_player(current_board_side);
            }

            if (current_board_side == 1){
                current_cell = board.get_p1_row().get_cell(current_index);
            } else {
                current_cell = board.get_p2_row().get_cell(current_index);
            }
            current_cell.insert_seeds(1);
        }
        check_last_seed(current_index, current_board_side, storage_index);
    }
    if (board.check_game_over()){
        let winner = board.game_over();

        drawBoard(board);
        announceWinner(winner);
        return;
    }
    player = change_player(player);
    drawBoard(board);
}

function check_cell(board, cell){
    let storage, opposite;
    const length = board.get_p1_row().get_storage().get_index();
    const cell_index = cell.get_index();
    switch (player) {  
        case 1:
            storage = board.get_p1_row().get_storage();
            opposite = board.get_p2_row().get_cell(length - cell_index - 1);
            break;
        case 2:
            storage = board.get_p2_row().get_storage();
            opposite = board.get_p1_row().get_cell(length - cell_index - 1);
            break;
        default:
            break;
    }
    storage.transfer_seeds(cell);
    if (opposite.get_seed_num() != 0) player = change_player(player);
    storage.transfer_seeds(opposite);
}


function check_last_seed(current_index, current_board_side, storage_index){
    if (current_index == storage_index && player == current_board_side){
        player = change_player(player);
    }
}

async function computer_lvl_1(board, possible_moves){
    if (possible_moves.length != 0){
        const move = possible_moves[Math.floor(Math.random() * possible_moves.length)];
        await new Promise(r => setTimeout(r, 1000));
        sow(board, move, player);
    }
}

async function computer_lvl_2(board){
    let row, seed_max = 0, move;

    switch (player){
        case 1:
            row = board.get_p1_row();
            break;
        case 2:
            row = board.get_p2_row();
            break;
        default:
            break;
    }
    for (let i = 0; i < row.get_length();i++){
        if (row.get_cell(i).get_seed_num() > seed_max){
            move = row.get_cell(i).get_index();
            seed_max = row.get_cell(i).get_seed_num();
        }
    }

    await new Promise(r => setTimeout(r, 5000));
    sow(board, move, player);
}