function AI() {
    this.alterHtml();
    this.game = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
}

AI.prototype.alterHtml = function() {
    var controlDiv = document.createElement('div');
    controlDiv.className = 'above-game';
    controlDiv.innerHTML = '<p class="game-intro">Additional AI controls</p> <a class="restart-button">Start Solver</a>';
    var gameContainer = document.getElementsByClassName('game-container')[0];
    var container = gameContainer.parentNode;
    container.insertBefore(controlDiv, gameContainer);
};

AI.prototype.tick = function() {
    console.log(this);
    console.log(self);
    this.game.move(parseInt((Math.random()*10)%2))
};

function init() {
    window.ai = new AI();
    window.setInterval(function(){ai.tick();}, 1000);
}

window.requestAnimationFrame(init);
