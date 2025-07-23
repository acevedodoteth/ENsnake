const config = {
  type: Phaser.AUTO,
  width: 400,
  height: 400,
  backgroundColor: '#1d1d1d',
  physics: {
      default: 'arcade',
      arcade: {
          debug: false
      }
  },
  scene: {
      preload,
      create,
      update
  }
};

let snake;
let food;
let direction = 'RIGHT';
let nextDirection = 'RIGHT';
let moveTimer = 0;
let moveDelay = 150;

let snakeBody = [];

const game = new Phaser.Game(config);

function preload() {
  this.load.image('body', 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Green_circle.svg');
  this.load.image('food', 'https://upload.wikimedia.org/wikipedia/commons/e/ec/RedDot.svg');
}

function create() {
  snakeBody = [];
  let startX = 5;
  let startY = 5;

  for (let i = 0; i < 3; i++) {
      let segment = this.add.image(startX - i * 1 * 20, startY * 20, 'body').setOrigin(0);
      snakeBody.push(segment);
  }

  food = this.add.image(200, 200, 'food').setOrigin(0);
  placeFood.call(this);

  this.input.keyboard.on('keydown', function (event) {
      switch (event.key) {
          case 'ArrowUp':
              if (direction !== 'DOWN') nextDirection = 'UP';
              break;
          case 'ArrowDown':
              if (direction !== 'UP') nextDirection = 'DOWN';
              break;
          case 'ArrowLeft':
              if (direction !== 'RIGHT') nextDirection = 'LEFT';
              break;
          case 'ArrowRight':
              if (direction !== 'LEFT') nextDirection = 'RIGHT';
              break;
      }
  });
}

function update(time) {
  if (time >= moveTimer) {
      moveSnake.call(this);
      moveTimer = time + moveDelay;
  }
}

function moveSnake() {
  direction = nextDirection;

  const head = snakeBody[0];
  let newX = head.x;
  let newY = head.y;

  if (direction === 'LEFT') newX -= 20;
  else if (direction === 'RIGHT') newX += 20;
  else if (direction === 'UP') newY -= 20;
  else if (direction === 'DOWN') newY += 20;

  // Check collision with food
  if (Phaser.Math.Distance.Between(newX, newY, food.x, food.y) < 20) {
      const newSegment = this.add.image(newX, newY, 'body').setOrigin(0);
      snakeBody.unshift(newSegment);
      placeFood.call(this);
  } else {
      const tail = snakeBody.pop();
      tail.x = newX;
      tail.y = newY;
      snakeBody.unshift(tail);
  }
}

function placeFood() {
  const gridSize = 20;
  const maxCols = config.width / gridSize;
  const maxRows = config.height / gridSize;

  let x = Phaser.Math.Between(0, maxCols - 1) * gridSize;
  let y = Phaser.Math.Between(0, maxRows - 1) * gridSize;

  food.x = x;
  food.y = y;
}
