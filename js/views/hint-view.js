var HintView = function(board, players) {
    this._node = null;
    this._players = players;
    this._board = board;
    this._init(board, players);
};

HintView.prototype._onShipsCountError = function() {
    this._set('board', 'All ships must be placed.');
};

HintView.prototype._onShipsPlaceError = function() {
    this._set('board', 'Ships cannot occupy squares next to each other, horizontally, vertically or diagonally and gets out of battlefield.');
};

HintView.prototype._onPlayerSet = function() {
    this._set('board', 'Click on ship to place it to the battlefield. Ctrl+click on placed ship will change its orientation.');
};

HintView.prototype._onPlayerTurn = function() {
    this._set('player', 'Attacking');
};

HintView.prototype._onPlayerReady = function() {
    this._set('player', 'Ready to play');
};

HintView.prototype._onGameEnd = function() {
    this._set('player', 'Win');
};

HintView.prototype._set = function(type, text) {
    if(type === 'player'){
        var side = this._players.getCurrentSide();
        var otherSide = this._players.invertSide(this._players.getCurrentSide());
        this._node = $('.players');

        if(text.length){
            this._node.find('.'+side+' .hint').text(text).show();
        } else {
            this._node.find('.'+side+' .hint').text(text).hide();
        }

        this._node.find('.'+otherSide+' .hint').text('').hide();
    } else {
        var side = this._players.getPlayerSide();

        if(side in this._board._ready){
            return;
        }

        this._node = $('.ships');

        if(text.length){
            this._node.find('.'+side+' .hint').text(text).show();
        } else {
            this._node.find('.'+side+' .hint').text(text).hide();
        }
    }
};

HintView.prototype._clear = function() {
    this._set('');
};

HintView.prototype._addBoardListeners = function(board) {
    board.on('ships-count-error', $.proxy(this._onShipsCountError, this));
    board.on('ships-place-error', $.proxy(this._onShipsPlaceError, this));
    board.on('player-ready', $.proxy(this._onPlayerReady, this));
    board.on('game-end-notify', $.proxy(this._onGameEnd, this));
};

HintView.prototype._addPlayersListeners = function(players) {
    players.on('set', $.proxy(this._onPlayerSet, this));
    players.on('player-turn', $.proxy(this._onPlayerTurn, this));
};

HintView.prototype._init = function(board, players) {
    this._addBoardListeners(board);
    this._addPlayersListeners(players);
};
