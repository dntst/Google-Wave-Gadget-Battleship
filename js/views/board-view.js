var BoardView = function(board, players) {
    EventEmitter.mixin(this);
    this._node = null;
    this._board = board;
    this._players = players;
    this._init();
};

BoardView.CELL_SIZE = 40;

BoardView.prototype._createField = function() {
    this._node = $('.board');

    var first = '';
    var counter = 0;

    for(var i = 1; i <= Board.SIZE[1]; i++){
        for(var j = 1; j <= Board.SIZE[0]; j++){

            first = '';

            if(j == 1){
                first = 'first';
            }

            counter++;

            this._node.append('<div class="sector sector-'+counter+' '+first+'"></div>');
        }
    }
};

BoardView.prototype._prepareForBattle = function(side){
    $('.boards .'+side+' div').addClass('active').on('click', $.proxy(function(event){
        if(this._players._side === side){
            return;
        }
        var element = $(event.target);
        var position = element.position();
        var x = position.left / BoardView.CELL_SIZE;
        var y = position.top / BoardView.CELL_SIZE;
        this.emit('attack', function() {
            return [side, y, x];
        });
    }, this));
};

BoardView.prototype._changeCount = function(side, type) {
    Ship.LEFT[type]--;
    $('.ships .'+side+' .counts .'+type).html(Ship.LEFT[type]);

    if(Ship.LEFT[type] == 0){
        $('.ships .'+side+' .boats .'+type).css('cursor', 'default').off();
    }
};

BoardView.prototype._addBoardListeners = function() {
    this._board.on('prepare', $.proxy(this._prepareForBattle, this));
};

BoardView.prototype._addClickListener = function() {
    $('.ships .left .boats .ship, .ships .right .boats .ship').click($.proxy(function(event) {
        var element = $(event.target).clone();
        var side = $(event.target).parent().parent().attr('class');
        var board = $('.boards .'+side);

        element.off('click');

        board.append(element);

        element.css('position','absolute').on('click', $.proxy(function(event){
            var el = $(event.target);
            if(event.ctrlKey){
                if(el.hasClass('v')){
                    el.removeClass('v').addClass('h');
                    var orientation = 'h';
                } else {
                    el.removeClass('h').addClass('v');
                    var orientation = 'v';
                }

                var id = el.attr('id');
                var position = el.position();
                var x = position.left / BoardView.CELL_SIZE;
                var y = position.top / BoardView.CELL_SIZE;

                this.emit('update-ship', $.proxy(function() {
                    return [id, side, y, x, orientation];
                }, this));
            }
        }, this)).draggable({
            grid: [40,40],
            containment: board
        });

        element.on('dragstop', $.proxy(function(event, ui){
            var el = $(event.target);
            if(el.attr('id')){
                var id = el.attr('id');
                var position = el.position();
                var x = position.left / BoardView.CELL_SIZE;
                var y = position.top / BoardView.CELL_SIZE;

                if(el.hasClass('h')){
                    var orientation = 'h';
                } else {
                    var orientation = 'v';
                }

                this.emit('update-ship', $.proxy(function() {
                    return [id, side, y, x, orientation];
                }, this));
            }
        }, this));

        board.find('div').droppable({
            accept: ".ship"
        });

        for (var i in Ship.TYPES) {
            if(element.hasClass(Ship.TYPES[i])){
                this.emit('place-ship', function() {
                    return [side, Ship.TYPES[i], element.index()];
                });
                this._changeCount(side, Ship.TYPES[i]);
            }
        }

    }, this));

    $('.players .left .ready, .players .right .ready').click($.proxy(function(event) {
        var element = $(event.target);

        if($(event.target).parent().hasClass(Ship.SIDES.LEFT)){
            var side = Ship.SIDES.LEFT;
        } else if($(event.target).parent().hasClass(Ship.SIDES.RIGHT)) {
            var side = Ship.SIDES.RIGHT;
        }

        this._board._checkPlayerReady(side);

    }, this));
};

BoardView.prototype._init = function() {
    this._createField();
    this._addBoardListeners();
    this._addClickListener();
};
