var Board = function(players) {
    EventEmitter.mixin(this);
    this._players = players;
    this._ready = {};
    this._field = {};
    this._fields = {};
    this._ships = {};
    this._attacks = {};
    this._shipsLeft = {};
    this._gameEnd = false;
};

Board.SIZE = [10,10];

Board.prototype._createField = function() {
    this._field = [];

    for(var i = -1; i <= Board.SIZE[1]; i++){
        this._field[i] = [];
        for(var j = -1; j <= Board.SIZE[0]; j++){
            this._field[i][j] = null;
        }
    }
};

Board.prototype._hasUnplacesShips = function(){
    for(var i in Ship.LEFT){
        if(Ship.LEFT[i] > 0){
            return true;
        }
    }

    return false;
};

Board.prototype._createOffset = function(id, x, y, orientation, side){

    var ship = this._ships[side][id];
    var size = ship.getSize();
    var shipId = ship.getId();

    if(orientation == 'h'){
        for(var iy = y - 1; iy <= y + 1; iy++){
            for(var ix = x - 1; ix <= x + size; ix++){
                if(iy > Board.SIZE[1] || ix > Board.SIZE[0]){
                    return false;
                }
                if(this._field[iy][ix] == null || this._field[iy][ix] === 'reserved'){
                    if(ix >= x && ix < x + size && iy == y){
                        if(this._field[iy][ix] === 'reserved'){
                            return false;
                        } else {
                            this._field[iy][ix] = shipId;
                        }
                    } else {
                        this._field[iy][ix] = 'reserved';
                    }
                } else {
                    return false;
                }
            }
        }
    } else {
        for(var iy = y - 1; iy <= y + size; iy++){
            for(var ix = x - 1; ix <= x + 1; ix++){
                if(iy > Board.SIZE[1] || ix > Board.SIZE[0]){
                    return false;
                }
                if(this._field[iy][ix] == null || this._field[iy][ix] === 'reserved'){
                    if(iy >= y && iy < y + size && ix == x){
                        if(this._field[iy][ix] === 'reserved'){
                            return false;
                        } else {
                            this._field[iy][ix] = shipId;
                        }
                    } else {
                        this._field[iy][ix] = 'reserved';
                    }
                } else {
                    return false;
                }
            }
        }
    }

    return true;
};

Board.prototype._showOffset = function(id, x, y, orientation, side){

    var ship = this._ships[side][id];
    var size = ship.getSize();
    var board = $('.boards .'+side);

    if(orientation == 'h'){
        for(var iy = y - 1; iy <= y + 1; iy++){
            for(var ix = x - 1; ix <= x + size; ix++){
                if(ix >= x && ix < x + size && iy == y){
                } else {
                    if(board.find('.mark-'+iy+'-'+ix).length == 0 && iy >= 0 && ix >= 0){
                        board.find('.sector').eq((iy * 10) + ix).removeClass('active').off('click');
                        board.append('<div style="left: '+(ix * BoardView.CELL_SIZE)+'px; top: '+(iy * BoardView.CELL_SIZE)+'px;" class="reserved mark-'+iy+'-'+ix+'"></div>');
                    }
                }
            }
        }
    } else {
        for(var iy = y - 1; iy <= y + size; iy++){
            for(var ix = x - 1; ix <= x + 1; ix++){
                if(iy >= y && iy < y + size && ix == x){
                } else {
                    if(board.find('.mark-'+iy+'-'+ix).length == 0 && iy >= 0 && ix >= 0){
                        board.find('.sector').eq((iy * 10) + ix).removeClass('active').off('click');
                        board.append('<div style="left: '+(ix * BoardView.CELL_SIZE)+'px; top: '+(iy * BoardView.CELL_SIZE)+'px;" class="reserved mark-'+iy+'-'+ix+'"></div>');
                    }
                }
            }
        }
    }

    return true;
};

Board.prototype._checkShipsPosition = function(side){

    this._createField();
    var valid = true;

    $('.boards .'+side+' .ship').each($.proxy(function(index, element){
        var el = $(element);
        var id = el.attr('id');
        var position = el.position();
        var x = position.left / BoardView.CELL_SIZE;
        var y = position.top / BoardView.CELL_SIZE;

        if(el.hasClass('h')){
            var orientation = 'h';
        } else {
            var orientation = 'v';
        }

        if(!this._createOffset(id, x, y, orientation, side)){
            return valid = false;
        }
    }, this));

    return valid;
};

Board.prototype._checkPlayerReady = function(side){
    if(!this._players.isPlayerViewing()){
        return;
    }
    if(this._hasUnplacesShips()){
        this.emit('ships-count-error', function() {
            return [];
        });
        return;
    }

    if(!this._checkShipsPosition(side)){
        this.emit('ships-place-error', function() {
            return [];
        });
        return;
    }

    var field = this._field;

    this.emit('ready', function() {
        return [side, field];
    });
};

Board.prototype.ready = function(side, fields) {
    this._ready[side] = true;
    this._fields[side] = fields;
    this._shipsLeft[side] = Ship.COUNT;
    $('.players .'+side+' .ready').hide();

    this._players._side = side;

    $('.ships .'+side+' .boats, .ships .'+side+' .counts, .ships .'+side+' .hint').hide();
    $('.boards .'+side+' .ship').css('cursor', 'default').off('click').each(function(){
        if($(this).hasClass("ui-draggable")){
            $(this).draggable('destroy');
        }
    });

    if(this._players.isPlayerViewing()){
        if(this._players.getPlayerSide() == side)
        {
            if (!(side in this._ships)) {
                return;
            }
            for(var i in this._ships[side]){
                var id = this._ships[side][i].getId();
                if($('#'+id).length == 0){
                    this.showPlayerShip(side, id);
                }
            }
        }
    }

    this.emit('player-ready', function() {
        return [];
    });

    for(var i in Ship.SIDES){
        if (!(Ship.SIDES[i] in this._ready)) {
            return;
        }
    }

    var turnSide = this._players.invertSide(Ship.SIDES.RIGHT);
    this.turn(turnSide);

    if(!this._players.isPlayerViewing()){
        return;
    }

    var prepareSide = this._players.invertSide(this._players.getPlayerSide());
    this.emit('prepare', function() {
        return [prepareSide];
    });
};

Board.prototype.attack = function(side, y, x) {
    if (!(side in this._attacks)) {
        this._attacks[side] = {};
    }
    if (!(y in this._attacks[side])) {
        this._attacks[side][y] = {};
    }
    if(x in this._attacks[side][y]){
        return;
    }
    this._attacks[side][y][x] = true;
    var cell = this._fields[side][y][x];
    var board = $('.boards .'+side);
    board.find('.sector').eq((y * 10) + x).removeClass('active').off('click');
    if(cell == null || cell === 'reserved'){
        board.append('<div style="left: '+(x * BoardView.CELL_SIZE)+'px; top: '+(y * BoardView.CELL_SIZE)+'px;" class="empty mark-'+y+'-'+x+'"></div>');
        this.turn(side);
    } else {
        var ship = this._ships[side][cell];
        var life = ship.getLife();
        life--;
        ship.setLife(life);
        if(life == 0){
            this.emit('show-ship', $.proxy(function() {
                return [side, cell];
            }, this));
            board.append('<div style="left: '+(x * BoardView.CELL_SIZE)+'px; top: '+(y * BoardView.CELL_SIZE)+'px;" class="destroyed ship-'+cell+'"></div>');
            board.find('.ship-'+cell).removeClass('attacked').addClass('destroyed');
            this._shipsLeft[side]--;
            if(this._shipsLeft[side] == 0){
                this.emit('game-end', $.proxy(function() {
                    return [side];
                }, this));
            }
        } else {
            board.append('<div style="left: '+(x * BoardView.CELL_SIZE)+'px; top: '+(y * BoardView.CELL_SIZE)+'px;" class="attacked ship-'+cell+'"></div>');
        }
    }
};

Board.prototype.showShip = function(side, id) {
    var playerSide = this._players.getPlayerSide();
    var board = $('.boards .'+side);
    var ship = this._ships[side][id];
    var coords = ship.getCoords();
    var orientation = ship.getOrientation();
    var type = ship.getType();
    if(playerSide == side){
        $('#'+id).css('opacity', '0.4');
    } else {
        if(board.find('.ship-showed-'+id).length == 0){
            board.append('<div style="cursor: default; opacity: 0.4; position: absolute; left: '+(coords[1] * BoardView.CELL_SIZE)+'px; top: '+(coords[0] * BoardView.CELL_SIZE)+'px;" class="ship '+orientation+' '+type+' ship-showed-'+id+'"></div>');
        }
    }
    this._showOffset(id, coords[1], coords[0], orientation, side);
};

Board.prototype.showPlayerShip = function(side, id) {
    var board = $('.boards .'+side);
    var ship = this._ships[side][id];
    var coords = ship.getCoords();
    var orientation = ship.getOrientation();
    var type = ship.getType();
    board.append('<div id="'+id+'" style="cursor: default; position: absolute; left: '+(coords[1] * BoardView.CELL_SIZE)+'px; top: '+(coords[0] * BoardView.CELL_SIZE)+'px;" class="ship '+orientation+' '+type+'"></div>');
};

Board.prototype.showAllShip = function(side, id) {
    var board = $('.boards .'+side);
    var ship = this._ships[side][id];
    var coords = ship.getCoords();
    var orientation = ship.getOrientation();
    var type = ship.getType();
    board.append('<div style="cursor: default; position: absolute; left: '+(coords[1] * BoardView.CELL_SIZE)+'px; top: '+(coords[0] * BoardView.CELL_SIZE)+'px;" class="ship '+orientation+' '+type+'"></div>');
};

Board.prototype.placeShip = function(side, type, index) {
    if (!(side in this._ships)) {
        this._ships[side] = {};
    }

    var ship = Ship.get(side, type);
    if(ship.getId() > Ship.COUNT){
        this._ships[side] = {};
        Ship._id = null;
        ship = Ship.get(side, type);
    }
    ship.setCoords([0,0]);
    ship.setOrientation('h');
    this._ships[side][ship.getId()] = ship;
    if(this._players.isPlayerSide(side)){
        $('.boards .'+side+' div').eq(index).attr('id', ship.getId());
    }
};

Board.prototype.updateShip = function(id, side, y, x, orientation) {
    if (!(side in this._ships)) {
        return;
    }
    if (!(id in this._ships[side])) {
        return;
    }
    this._ships[side][id].setCoords([y,x]);
    this._ships[side][id].setOrientation(orientation);
};

Board.prototype.turn = function(side){
    if(this._gameEnd){
        return;
    }
    if(this._players._side === side){
        return;
    }
    this.emit('set-turn', $.proxy(function() {
        return [side];
    }, this));
};

Board.prototype.gameEnd = function(side) {
    this._gameEnd = true;
    this._players._side = this._players.invertSide(side);
    var board = $('.boards .left .sector, .boards .right .sector').removeClass('active').off('click');

    if(this._players.isPlayerViewing()){
        var showSide = this._players.invertSide(this._players.getPlayerSide());
        board = $('.boards .'+showSide);
        for(var i in this._ships[showSide]){
            var id = this._ships[showSide][i].getId();
            if(board.find('.ship-showed-'+id).length == 0){
                this.showAllShip(showSide, id);
            }
        }
    } else {
        for(var j in Ship.SIDES){
            board = $('.boards .'+Ship.SIDES[j]);
            for(var i in this._ships[Ship.SIDES[j]]){
                var id = this._ships[Ship.SIDES[j]][i].getId();
                if(board.find('.ship-showed-'+id).length == 0){
                    this.showAllShip(Ship.SIDES[j], id);
                }
            }
        }
    }

    this.emit('game-end-notify', $.proxy(function() {
        return [];
    }, this));
};