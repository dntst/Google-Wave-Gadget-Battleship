var PlayersView = function(players, board) {
    EventEmitter.mixin(this);
    this._board = board;
    this._players = players;
    this._node = null;
    this._init();
};

PlayersView.prototype._onSetPlayer = function(side, player) {
    var node = this._node.find('.player.' + side);
    node.find('input').hide();
    var name = player.getName();
    node.find('.name').text(name);
    var avatar = player.getAvatar();
    if (avatar) {
        node.find('.avatar').html('<img width="40" height="40" src="' + avatar + '">');
    }
    if(this._players.isPlayerSide(side)){
        $('.ships .'+side).find('.boats, .counts').show();
        node.find('.ready').show();
        gadgets.window.adjustHeight();
    }
};

PlayersView.prototype._addPlayersListeners = function() {
    this._players.on('set', $.proxy(this._onSetPlayer, this));
};

PlayersView.prototype._init = function() {
    this._node = $('.players');
    this._addPlayersListeners();
};
