var Players = function(users, board) {
    EventEmitter.mixin(this);
    this._users = users;
    this._board = board;
    this._list = {};
    this._side = null;
};

Players.prototype.getCurrentSide = function() {
    return this._side;
};

Players.prototype.set = function(side, id) {
    var info = this._users.get(id);
    var player = info ? new Player(info.id, info.name, info.avatar) : new Player(id, '(Unknown)', null);
    this._list[side] = player;
    this.emit('set', function() {
        return [side, player];
    });
};

Players.prototype.checkForNewPlayer = function(side) {
    if (side in this._list) {
        return;
    }
    var otherSide = (side == Ship.SIDES.LEFT) ? Ship.SIDES.RIGHT : Ship.SIDES.LEFT;
    var info = this._users.getViewer();
    if (otherSide in this._list && this._list[otherSide].getId() == info.id) {
        return;
    }
    this.emit('new', $.proxy(function() {
        return [side, new Player(info.id, info.name, info.avatar)];
    }, this));
};

Players.prototype.isPlayerSide = function(side) {
    if (!(side in this._list)) {
        return false;
    }
    var info = this._users.getViewer();
    if (this._list[side].getId() != info.id) {
        return false;
    }
    return true;
};

Players.prototype.getPlayerSide = function() {
    var info = this._users.getViewer();
    for(var i in this._list){
        if (this._list[i].getId() == info.id) {
            return i;
        }
    }
    return false;
};

Players.prototype.isPlayerViewing = function() {
    var info = this._users.getViewer();
    for (var i in Ship.SIDES) {
        var side = Ship.SIDES[i];
        var player = this._list[side];
        if (player && player.getId() == info.id) {
            return true;
        }
    }
    return false;
};

Players.prototype.getPlayer = function() {
    return this._users.getViewer();
};

Players.prototype.setTurn = function(side) {
    this._side = side;
    this.emit('player-turn', function(){
        return [side];
    });
};

Players.prototype.invertSide = function(side) {
    return (side == Ship.SIDES.LEFT) ? Ship.SIDES.RIGHT : Ship.SIDES.LEFT;
};