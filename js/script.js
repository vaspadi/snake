window.addEventListener('DOMContentLoaded', function () {
	var canvas = document.getElementById('canvas');
	var gameOver = document.getElementById('game-over');
	var startMenu = document.getElementById('start-menu');
	var newGame = document.getElementsByClassName('new-game');
	var ctx = canvas.getContext('2d');
	var blockNum = 15;
	var width;
	var height;
	var blockWidth;
	var blockHeight;
	resizeGame();
	var directions = {
		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down'
	};
	var myScore;
	var nextRecord;
	var speed;
	var stop;
	var spawn;

	function resizeGame() {
		var snake = document.getElementById('snake');
		var html = document.getElementsByTagName('html')[0];
		var newWidth = window.innerWidth * 0.99;
		var newHeight = window.innerHeight * 0.99;
		var widthToHeight = snake.clientWidth / snake.clientHeight;
		var newWidthToHeight = newWidth / newHeight;

		if (widthToHeight < newWidthToHeight) {
			newWidth = newHeight * widthToHeight;
			snake.style.height = newHeight + 'px';
			snake.style.width = newWidth + 'px';
		} else {
			newHeight = newWidth / widthToHeight;
			snake.style.height = newHeight + 'px';
			snake.style.width = newWidth + 'px';
		}

		canvas.width = newWidth;
		canvas.height = newHeight;
		html.style.fontSize = (newWidth / 1100) + 'em';
		width = canvas.width;
		height = canvas.height;
		blockWidth = width / blockNum;
		blockHeight = height / blockNum;
		clearField();
	}

	function clearField() {
		ctx.clearRect(0, 0, width, height);
		ctx.fillStyle = '#eee600';
		ctx.fillRect(0, 0, width, height);
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, width, blockHeight); // up
		ctx.fillRect(width - blockWidth, 0, blockWidth, height); // right
		ctx.fillRect(0, 0, blockWidth, height); // left
		ctx.fillRect(0, height - blockHeight, width, blockHeight); // down
	}

	function drawScore() {
		var fontSize = width / 20;
		ctx.font = "".concat(fontSize, "px Black Ops One");
		ctx.lineWidth = fontSize / 20;
		ctx.textBaseline = 'top';
		ctx.fillStyle = '#f00';
		ctx.strokeStyle = '#000';
		ctx.fillText('Score: ' + myScore, blockWidth * 1.25, blockHeight * 1.25);
		ctx.strokeText('Score: ' + myScore, blockWidth * 1.25, blockHeight * 1.25);
	}

	function callGameOver() {
		var score = document.getElementById('score');

		gameOver.style.display = 'flex';
		score.textContent = myScore;
	}

	function setSpeed() {
		if (myScore === nextRecord && speed > 100) {
			speed -= 50;
			nextRecord += 10;
		}
		return speed;
	}

	function getRandomNum(min, max, num) {
		if (num <= 1 || num === undefined) {
			return Math.floor(Math.random() * (max - min + 1) + min);
		}

		var arr = [];

		for (var i = 0; i < num; i++) {
			arr[i] = Math.floor(Math.random() * (max - min + 1) + min);
		}
		return arr;
	}

	function getRandomDirection() {
		return directions[getRandomNum(37, 40)];
	}

	var Block = function Block(col, row) {
		this.col = col;
		this.row = row;
	};

	Block.prototype.drawSquare = function (color, border) {
		var x = this.col * blockWidth;
		var y = this.row * blockHeight;
		var lineWidth = 0;
		var sizeError = 0;

		if (!!border) {
			lineWidth = blockWidth / 3.5;
			sizeError = lineWidth / 2;
			ctx.strokeStyle = border;
		}

		ctx.fillStyle = color;
		ctx.lineWidth = lineWidth;
		ctx.fillRect(x + sizeError, y + sizeError, blockWidth - lineWidth, blockHeight - lineWidth);

		if (!!border) {
			ctx.strokeRect(x + sizeError, y + sizeError, blockWidth - lineWidth, blockHeight - lineWidth);
		}
	};

	Block.prototype.drawCircle = function (color, border) {
		var centerX = this.col * blockWidth + blockWidth / 2;
		var centerY = this.row * blockHeight + blockHeight / 2;
		var lineWidth = 0;
		var sizeError = 0;

		if (!!border) {
			lineWidth = blockWidth / 6;
			sizeError = lineWidth / 2;
			ctx.strokeStyle = border;
		}

		ctx.fillStyle = color;
		ctx.lineWidth = lineWidth;
		ctx.beginPath();
		ctx.arc(centerX, centerY, blockWidth / 2 - sizeError, 0, Math.PI * 2, false);
		ctx.fill();

		if (!!border) {
			ctx.stroke();
		}
	};

	Block.prototype.equal = function (otherBlock) {
		return this.col === otherBlock.col && this.row === otherBlock.row;
	};

	var Snake = function Snake() {
		this.segments = [new Block(3, 1), new Block(2, 1), new Block(1, 1)];
		this.direction = 'right';
		this.nextDirection = 'right';
	};

	Snake.prototype.draw = function () {
		this.segments[0].drawSquare('#1f461f', '#17a017');

		for (var i = 1; i < this.segments.length; i++) {
			this.segments[i].drawSquare('#17a017', '#1f461f');
		}
	};

	Snake.prototype.move = function () {
		var head = this.segments[0];
		var newHead;
		this.direction = this.nextDirection;

		if (this.direction === 'right') {
			newHead = new Block(head.col + 1, head.row);
		} else if (this.direction === 'down') {
			newHead = new Block(head.col, head.row + 1);
		} else if (this.direction === 'left') {
			newHead = new Block(head.col - 1, head.row);
		} else if (this.direction === 'up') {
			newHead = new Block(head.col, head.row - 1);
		}

		if (this.checkCollisition(newHead)) {
			stop = true;
			return;
		}

		this.segments.unshift(newHead);

		if (newHead.equal(apple.position)) {
			myScore++;
			apple.move();
		} else {
			this.segments.pop();
		}
	};

	Snake.prototype.checkCollisition = function (head) {
		var wallCollisition = false;
		var selfCollisition = false;

		if (head.col === 0 || head.row === 0 || head.col === blockNum - 1 || head.row === blockNum - 1) {
			wallCollisition = true;
		}

		for (var i = 0; i < this.segments.length; i++) {
			if (head.equal(this.segments[i])) {
				selfCollisition = true;
			}
		}

		return wallCollisition || selfCollisition;
	};

	Snake.prototype.setDirection = function (newDirection) {
		if (this.direction === 'up' && newDirection === 'down') {
			return;
		} else if (this.direction === 'right' && newDirection === 'left') {
			return;
		} else if (this.direction === 'down' && newDirection === 'up') {
			return;
		} else if (this.direction === 'left' && newDirection === 'right') {
			return;
		}

		this.nextDirection = newDirection;
	};

	Snake.prototype.spawn = function () {
		var head;
		var segments = [];
		this.direction = getRandomDirection();
		this.nextDirection = this.direction;

		if (this.direction === 'up') {
			head = new Block(getRandomNum(1, blockNum - 2), getRandomNum(4, blockNum - 6));
			segments[0] = head;
			segments[1] = new Block(head.col, head.row + 1);
			segments[2] = new Block(head.col, head.row + 2);
		} else if (this.direction === 'right') {
			head = new Block(getRandomNum(4, blockNum - 6), getRandomNum(1, blockNum - 2));
			segments[0] = head;
			segments[1] = new Block(head.col - 1, head.row);
			segments[2] = new Block(head.col - 2, head.row);
		} else if (this.direction === 'down') {
			head = new Block(getRandomNum(1, blockNum - 2), getRandomNum(4, blockNum - 6));
			segments[0] = head;
			segments[1] = new Block(head.col, head.row - 1);
			segments[2] = new Block(head.col, head.row - 2);
		} else if (this.direction === 'left') {
			head = new Block(getRandomNum(4, blockNum - 6), getRandomNum(1, blockNum - 2));
			segments[0] = head;
			segments[1] = new Block(head.col + 1, head.row);
			segments[2] = new Block(head.col + 2, head.row);
		}

		this.segments = segments;
	};

	var Apple = function Apple() {
		this.position = new Block(5, 5);
	};

	Apple.prototype.draw = function () {
		this.position.drawCircle('#f00', '#bd0000');
	};

	Apple.prototype.move = function () {
		var randomCol = getRandomNum(1, blockNum - 2);
		var randomRow = getRandomNum(1, blockNum - 2);
		this.position = new Block(randomCol, randomRow);

		for (var i = 0; i < snake.segments.length; i++) {
			if (this.position.equal(snake.segments[i])) {
				this.move();
				break;
			}
		}
	};

	var snake = new Snake();
	var apple = new Apple();
	clearField();
	startMenu.style.display = 'flex';

	for (var i = 0; i < newGame.length; i++) {
		newGame[i].addEventListener('click', function () {
			startMenu.style.display = 'none';
			gameOver.style.display = 'none';
			myScore = 0;
			nextRecord = 10;
			speed = 300;
			stop = false;
			spawn = true;
			var timerId = setTimeout(function animation() {
				clearField();

				if (spawn) {
					snake.spawn();
					apple.move();
					spawn = false;
				}

				snake.move();
				snake.draw();
				apple.draw();
				drawScore();

				if (!stop) {
					timerId = setTimeout(animation, setSpeed());
				} else {
					callGameOver();
				}
			}, speed);
		});
	}

	window.addEventListener('resize', resizeGame, false);
	window.addEventListener('orientationchange', resizeGame, false);

	window.addEventListener('keydown', function (event) {
		var newDirection = directions[event.keyCode];
		if (newDirection !== undefined) snake.setDirection(newDirection);
	});

	Hammer(window).on('swipe', function(event) {
		snake.setDirection(event.gesture.direction);
	});
});