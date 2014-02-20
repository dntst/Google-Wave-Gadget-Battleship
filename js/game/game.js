var Game = function(users) {
    EventEmitter.mixin(this);
    this._board = null;
    this._players = null;
    this._init(users);
};

Game.prototype._onNewPlayer = function(side, player) {
    this.emit('update', function() {
        return [{
            type: 'player',
            side: side,
            id: player.getId()}
        ];
    });
};

Game.prototype._onPlayerReady = function(side, field) {
    this.emit('update', function() {
        return [{
            type: 'ready',
            side: side,
            field: field
        }];
    });
};

Game.prototype._onPlayerTurn = function(side) {
    this.emit('update', function() {
        return [{
            type: 'turn',
            side: side
        }];
    });
};

Game.prototype._onPlaceShip = function(side, type, index) {
    this.emit('update', function() {
        return [{
            type: 'ship',
            side: side,
            shipType: type,
            index: index
        }];
    });
};

Game.prototype._onUpdateShip = function(id, side, y, x, orientation) {
    this.emit('update', function() {
        return [{
            type: 'ship-update',
            id: id,
            side: side,
            y: y,
            x: x,
            orientation: orientation
        }];
    });
};

Game.prototype._onShowShip = function(side, id) {
    this.emit('update', function() {
        return [{
            type: 'ship-show',
            id: id,
            side: side
        }];
    });
};

Game.prototype._onAttack = function(side, y, x) {
    this.emit('update', function() {
        return [{
            type: 'attack',
            side: side,
            y: y,
            x: x
        }];
    });
};

Game.prototype._onGameEnd = function(side) {
    this.emit('update', function() {
        return [{
            type: 'game-end',
            side: side
        }];
    });
};

Game.prototype._initBoard = function() {
    var view = new BoardView(this._board, this._players);
    view.on('place-ship', $.proxy(this._onPlaceShip, this));
    view.on('update-ship', $.proxy(this._onUpdateShip, this));
    view.on('attack', $.proxy(this._onAttack, this));
};

Game.prototype._initPlayers = function() {
    var view = new PlayersView(this._players, this._board);
};

Game.prototype._initHint = function() {
    var view = new HintView(this._board, this._players);
};

Game.prototype._addClickListener = function(users) {
    $('#left, #right').click($.proxy(function(event) {
        var node = $(event.target);
        var side = node.attr('id');

        this._players.checkForNewPlayer(side);

        return false;
    }, this));
};

Game.prototype._init = function(users) {
    this._players = new Players(users, this._board);
    this._players.on('new', $.proxy(this._onNewPlayer, this));
    this._board = new Board(this._players);
    this._board.on('ready', $.proxy(this._onPlayerReady, this));
    this._board.on('set-turn', $.proxy(this._onPlayerTurn, this));
    this._board.on('show-ship', $.proxy(this._onShowShip, this));
    this._board.on('game-end', $.proxy(this._onGameEnd, this));
    this._initBoard();
    this._initPlayers();
    this._initHint();
    this._addClickListener(users);
};

Game.prototype._handleUpdate = function(update) {
    if (update.type == 'player') {
        this._players.set(update.side, update.id);
        return true;
    }
    if (update.type == 'ready') {
        this._board.ready(update.side, update.field);
        return true;
    }
    if (update.type == 'turn') {
        this._players.setTurn(update.side);
        return true;
    }
    if (update.type == 'ship') {
        this._board.placeShip(update.side, update.shipType, update.index);
        return true;
    }
    if (update.type == 'ship-update') {
        this._board.updateShip(update.id, update.side, update.y, update.x, update.orientation);
        return true;
    }
    if (update.type == 'ship-show') {
        this._board.showShip(update.side, update.id);
        return true;
    }
    if (update.type == 'attack') {
        this._board.attack(update.side, update.y, update.x);
        return true;
    }
    if (update.type == 'game-end') {
        this._board.gameEnd(update.side);
        return true;
    }
    return false;
};

Game.prototype.update = function(update) {
    this._handleUpdate(update);
};
