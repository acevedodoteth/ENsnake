const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 400,
  backgroundColor: '#222',
  physics: {
    default: 'arcade',
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

let snake;
let food;
let cursors;
let gridSize = 20;
let moveDelay = 0;
let moveInterval = 150; // ms between moves
let direction = 'RIGHT';

function preload() {
  // We'll draw shapes manually, so no assets needed.
}

function create() {
  // Create snake as an array of parts (each part is a Phaser rectangle)
  snake = [];

  // Starting position of the snake's head
  let startX = gridSize * 5;
  let startY = gridSize * 5;

  // Create 3 parts of snake initially
  for (let i = 0; i < 3; i++) {
    let part = this.add.rectangle(startX - i * gridSize, startY, gridSize - 2, gridSize - 2, 0x00ff00).setOrigin(0);
    snake.push(part);
  }

  // Create food as a rectangle
  food = this.add.rectangle(0, 0, gridSize - 2, gridSize - 2, 0xff0000).setOrigin(0);
  placeFood(this);

  cursors = this.input.keyboard.createCursorKeys();

  this.score = 0;
  this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '20px', fill: '#0f0' });
}

function update(time) {
  if (time < moveDelay) {
    return;
  }

  moveDelay = time + moveInterval;

  // Update direction based on input but disallow direct opposite moves
  if (cursors.left.isDown && direction !== 'RIGHT') {
    direction = 'LEFT';
  } else if (cursors.right.isDown && direction !== 'LEFT') {
    direction = 'RIGHT';
  } else if (cursors.up.isDown && direction !== 'DOWN') {
    direction = 'UP';
  } else if (cursors.down.isDown && direction !== 'UP') {
    direction = 'DOWN';
  }

  moveSnake(this);
}

function moveSnake(scene) {
  // Calculate new head position
  let head = snake[0];
  let newX = head.x;
  let newY = head.y;

  if (direction === 'LEFT') {
    newX -= gridSize;
  } else if (direction === 'RIGHT') {
    newX += gridSize;
  } else if (direction === 'UP') {
    newY -= gridSize;
  } else if (direction === 'DOWN') {
    newY += gridSize;
  }

  // Check for wall collisions (wrap around)
  if (newX < 0) newX = config.width - gridSize;
  else if (newX >= config.width) newX = 0;
  if (newY < 0) newY = config.height - gridSize;
  else if (newY >= config.height) newY = 0;

  // Check for self collision - if new head position matches any part of snake
  for (let part of snake) {
    if (part.x === newX && part.y === newY) {
      // Game over - reset the game
      resetGame(scene);
      return;
    }
  }

  // Move body parts - start from tail, each part takes position of the one before it
  for (let i = snake.length - 1; i > 0; i--) {
    snake[i].x = snake[i - 1].x;
    snake[i].y = snake[i - 1].y;
  }

  // Move head to new position
  head.x = newX;
  head.y = newY;

  // Check if snake eats the food
  if (head.x === food.x && head.y === food.y) {
    // Add new part at the tail (position will be updated on next move)
    let tail = snake[snake.length - 1];
    let newPart = scene.add.rectangle(tail.x, tail.y, gridSize - 2, gridSize - 2, 0x00ff00).setOrigin(0);
    snake.push(newPart);

    placeFood(scene);

    this.score++;
    this.scoreText.setText('Score: ' + this.score);
  }
}

function placeFood(scene) {
  let x = Phaser.Math.Between(0, (config.width / gridSize) - 1) * gridSize;
  let y = Phaser.Math.Between(0, (config.height / gridSize) - 1) * gridSize;

  // Make sure food is not placed on the snake
  for (let part of snake) {
    if (part.x === x && part.y === y) {
      // Recurse until a free spot is found
      placeFood(scene);
      return;
    }
  }

  food.x = x;
  food.y = y;
}

function resetGame(scene) {
  // Destroy all snake parts
  for (let part of snake) {
    part.destroy();
  }
  snake = [];
  direction = 'RIGHT';
  this.score = 0;
  this.scoreText.setText('Score: 0');

  // Recreate snake at start
  let startX = gridSize * 5;
  let startY = gridSize * 5;

  for (let i = 0; i < 3; i++) {
    let part = scene.add.rectangle(startX - i * gridSize, startY, gridSize - 2, gridSize - 2, 0x00ff00).setOrigin(0);
    snake.push(part);
  }

  placeFood(scene);
}
