/**
 * Array extension.
 *
 * @returns {Array}
 */
Array.prototype.clone = function() {
    return this.slice(0);
};

function AI() {
    this.best_operation = 0;
    this.grid = [];
    this.node = 0;
    this.max_depth = 3;
}
/**
 * Helper function that will shift all tiles to left.
 *  0 2 2 4  -> 2 2 4 0
 *  2 0 2 8  -> 2 2 8 0
 *  4 8 0 4  -> 4 8 4 0
 *  0 0 2 0  -> 2 0 0 0
 *
 * @param {Array} input This is the input array with 16 elements.
 * @returns {Array} The output array with 16 elements in it.
 */
AI.prototype.shiftLeft = function(input) {
    for(var i = 0; i < 4; i++) {
        var empty = -1;
        for(var j = 0; j < 4; j++) {
            var key = i*4 + j;
            if(input[key] == 0) {
                empty = j;
                continue;
            }

            if(empty >= 0) {
                var emptyKey = i*4 + empty;
                input[emptyKey] = input[key];
                input[key] = 0;
                empty++;
            }
        }
    }
    return input;
};

/**
 * Merges the tiles to the left. Before merging, shifts left them.
 *
 * @param {Array} input
 * @returns {*[]} This is the result and the score gained after the move.
 */
AI.prototype.mergeLeft = function(input) {
    var result = input.clone();
    result = this.shiftLeft(result);
    var score = 0
    for(var i = 0; i < 4; i++) {
        for(var j = 0; j < 4; j++) {
            var key = i*4 + j;
            if(j < 3 && result[key] == result[key+1]) {
                result[key] = result[key] * 2;
                score += result[key];
                for(var k = j + 1; k < 3; k++) {
                    var searchKey = i*4 + k;
                    result[searchKey] = result[searchKey + 1];
                    result[searchKey + 1] = 0;
                }
            }
        }
    }
    return [result, score];
};

/**
 * Keeping it simple. Knowing only how to move left, so, for other moves we will rotate the grid clockwise.
 * @param input
 * @returns {Array} The rotated grid.
 */
AI.prototype.transpose = function(input) {
    output = [
        input[12], input[8],  input[4], input[0],
        input[13], input[9],  input[5], input[1],
        input[14], input[10], input[6], input[2],
        input[15], input[11], input[7], input[3]
    ];

    return output;
};

/**
 * Adds the tile on the specified position by x and y.
 *
 * @param {int} x The x position
 * @param {int} y The y position
 * @param {int} value The value of the tile.
 */
AI.prototype.addTile = function(x, y, value) {
    this.grid[x + y * 4] = value;
};
    var controlDiv = document.createElement('div');
    controlDiv.className = 'above-game';
    controlDiv.innerHTML = '<p class="game-intro">Additional AI controls</p><a class="restart-button">Start Solver</a>';
    var gameContainer = document.getElementsByClassName('game-container')[0];
    var container = gameContainer.parentNode;
    container.insertBefore(controlDiv, gameContainer);
};

function autoRun() {
    if (!global_game || global_game.isGameTerminated()) return;
    var ai = new AI();
    for (var i = 0; i < 4; ++i) {
        for (var j = 0; j < 4; ++j) {
            var t = global_game.grid.cells[i][j];
            if (t) {
                ai.addTile(i, j, t.value);
            } else {
                ai.addTile(i, j, 0);
            }
        }
    }
    var dir = [3, 2, 1, 0];
    ai.initOneStepSearch();
    global_game.move(dir[ai.best_operation]);
    setTimeout(autoRun, 0);
}
