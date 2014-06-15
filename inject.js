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

/**
 * Compute the heuristic for a board configuration
 *
 * @param input
 * @returns {number}
 */
AI.prototype.heuristic = function(input) {
    var penalty = 0;
    var sum = 0;
    for (var i = 0; i < 16; ++i) {
        sum += input[i];
        if (i % 4 != 3) {
            penalty += Math.abs(input[i] - input[i + 1]);
        }

        if (i < 12) {
            penalty += Math.abs(input[i] - input[i + 4]);
        }
    }
    return 4 * sum - 2 * penalty;
};

/**
 * The base AI algorithm.
 *
 * @param input grid
 * @param depth value for recurrence
 * @returns {number}
 */
AI.prototype.search = function(input, depth) {
    this.node++;
    if (depth >= this.max_depth) {
        return this.heuristic(input);
    }
    var best = -1e+30;
    var i = 0;
    var j = 0;
    for (i = 0; i < 4; i++) {
        var results = this.mergeLeft(input);
        var tmp = results[0];
        var same = true;

        // Checking if the move was performed.
        for (j = 0; j < 16; j++) {
            if (tmp[j] != input[j]) {
                same = false;
                break;
            }
        }

        // If the move was performed (i.e. is possible), then go recursively.
        if (!same) {
            var temp = 0;
            var empty_slots = 0;
            for (j = 0; j < 16; j++) {
                if (tmp[j] == 0) {
                    tmp[j] = 2;
                    empty_slots++;
                    temp += this.search(tmp, depth + 1) * 0.9;
                    tmp[j] = 4;
                    temp += this.search(tmp, depth + 1) * 0.1;
                    tmp[j] = 0;
                }
            }
            if (empty_slots != 0) {
                temp /= empty_slots;
            } else {
                temp = -1e+10;
            }

            if (results[1] + temp > best) {
                best = results[1] + temp;
                if (depth == 0) {
                    this.best_operation = i;
                }
            }
        }

        if (i < 3) {
            input = this.transpose(input);
        }
    }
    return best;
};

AI.prototype.initOneStepSearch = function() {
    this.node = 0;
    this.max_depth = 3;
    while (true) {
        this.node = 0;
        this.search(this.grid, 0);

        // Preventing huge recursion trees.
        if (this.node >= 10000 || this.max_depth >= 8) {
            break;
        }
        this.max_depth += 1;
    }
};


// AI In action!
var global_game = null;
var old_requestAnimationFrame = window.requestAnimationFrame;

window.requestAnimationFrame(function(e) {
    window.requestAnimationFrame = old_requestAnimationFrame;
    global_game = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);

    var controlDiv = document.createElement('div');
    controlDiv.className = 'above-game';
    controlDiv.innerHTML = '<p class="game-intro">AI Extension:</p><a id="ai-btn" class="restart-button">Start the magic</a>';
    var gameContainer = document.getElementsByClassName('game-container')[0];
    var container = gameContainer.parentNode;
    container.insertBefore(controlDiv, gameContainer);
    document.getElementById('ai-btn').addEventListener("click", autoRun);
});

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
