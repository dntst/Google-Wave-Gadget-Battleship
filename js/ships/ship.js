var Ship = function(id, side) {
    this._id = id;
    this._side = side;
};

Ship.SIDES = {
    LEFT: 'left',
    RIGHT: 'right'
};

Ship.TYPES = {
    BOAT: 'boat',
    DESTROYER: 'destroyer',
    SUBMARINE: 'submarine',
    BATTLESHIP: 'battleship'
};

Ship.LEFT = {
    boat: 4,
    destroyer: 3,
    submarine: 2,
    battleship: 1
};

Ship.COUNT = 10;

Ship._getImplementationForType = function(type) {
    if (type == Ship.TYPES.BOAT) {
        return Boat;
    }
    if (type == Ship.TYPES.DESTROYER) {
        return Destroyer;
    }
    if (type == Ship.TYPES.SUBMARINE) {
        return Submarine;
    }
    if (type == Ship.TYPES.BATTLESHIP) {
        return Battleship;
    }
};

Ship.get = function(side, type) {
    if (!Ship._id) {
        Ship._id = 1;
    }
    var implementation = Ship._getImplementationForType(type);
    var ship = new implementation(Ship._id, side);
    Ship._id += 1;
    return ship;
};

Ship.set = function(id, side, type) {
    var implementation = Ship._getImplementationForType(type);
    var ship = new implementation(id, side);
    return ship;
};

Ship.prototype.getId = function() {
    return this._id;
};

Ship.prototype.getSide = function() {
    return this._side;
};

Ship.prototype.getType = function() {
    throw new Error('not implemented');
};

Ship.prototype.getLife = function() {
    return this._life;
};

Ship.prototype.setLife = function(life) {
    this._life = life;
};

Ship.prototype.getSize = function() {
    return this._size;
};

Ship.prototype.getCoords = function() {
    return this._coords;
};

Ship.prototype.setCoords = function(coords) {
    this._coords = coords;
};

Ship.prototype.getOrientation = function() {
    return this._orientation;
};

Ship.prototype.setOrientation = function(orientation) {
    this._orientation = orientation;
};

var Boat = function() {
    Ship.apply(this, arguments);
    this._life = 1;
    this._size = 1;
};
Boat.prototype = new Ship();

Boat.prototype.getType = function() {
    return Ship.TYPES.BOAT;
};


var Destroyer = function() {
    Ship.apply(this, arguments);
    this._life = 2;
    this._size = 2;
};
Destroyer.prototype = new Ship();

Destroyer.prototype.getType = function() {
    return Ship.TYPES.DESTROYER;
};


var Submarine = function() {
    Ship.apply(this, arguments);
    this._life = 3;
    this._size = 3;
};
Submarine.prototype = new Ship();

Submarine.prototype.getType = function() {
    return Ship.TYPES.SUBMARINE;
};


var Battleship = function() {
    Ship.apply(this, arguments);
    this._life = 4;
    this._size = 4;
};
Battleship.prototype = new Ship();

Battleship.prototype.getType = function() {
    return Ship.TYPES.BATTLESHIP;
};