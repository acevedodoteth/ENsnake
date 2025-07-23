const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  parent: 'phaser-example',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

let snake = [];
let snakeGroup;
let food;
let cursors;
let direction = 'RIGHT';
let newDirection = 'RIGHT';
let score = 0;
let scoreText;
let coin;
let coinTimer;
let coinActive = false;
let coinSpawnScore = 30;

function preload() {}

function create() {
  // Draw green border
  const graphics = this.add.graphics();
  graphics.lineStyle(2, 0x00ff00);
  graphics.strokeRect(0, 0, 800, 600);

  // Score text
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '20px',
    fill: '#00ff00'
  });

  // Snake initialization
  snake = [];
  snakeGroup = this.add.group();
  const startX = 160;
  const startY = 160;
  for (let i = 0; i < 3; i++) {
    const segment = this.add.rectangle(startX - i * 16, startY, 16, 16, 0x00ff00).setOrigin(0);
    snake.push(segment);
    snakeGroup.add(segment);
  }

  // Food
  food = this.add.rectangle(0, 0, 16, 16, 0xff0000).setOrigin(0);
  food.points = 1;
  placeFood();

  // Coin
  coin = this.add.rectangle(-100, -100, 16, 16, 0xffff00).setOrigin(0);
  coin.visible = false;

  // Input
  cursors = this.input.keyboard.createCursorKeys();

  // Snake movement loop
  this.time.addEvent({
    delay: 100,
    callback: moveSnake,
    callbackScope: this,
    loop: true
  });
}

function moveSnake() {
  const head = snake[0];
  let newX = head.x;
  let newY = head.y;

  if (newDirection === 'LEFT' && direction !== 'RIGHT') direction = 'LEFT';
  else if (newDirection === 'RIGHT' && direction !== 'LEFT') direction = 'RIGHT';
  else if (newDirection === 'UP' && direction !== 'DOWN') direction = 'UP';
  else if (newDirection === 'DOWN' && direction !== 'UP') direction = 'DOWN';

  if (direction === 'LEFT') newX -= 16;
  else if (direction === 'RIGHT') newX += 16;
  else if (direction === 'UP') newY -= 16;
  else if (direction === 'DOWN') newY += 16;

  // Check wall collision
  if (newX < 0 || newX >= 800 || newY < 0 || newY >= 600) {
    return gameOver(this);
  }

  // Check self collision
  for (let segment of snake) {
    if (segment.x === newX && segment.y === newY) {
      return gameOver(this);
    }
  }

  // Create new head
  const newHead = this.add.rectangle(newX, newY, 16, 16, 0x00ff00).setOrigin(0);
  snake.unshift(newHead);
  snakeGroup.add(newHead);

  // Check collisions
  if (Phaser.Geom.Intersects.RectangleToRectangle(newHead.getBounds(), food.getBounds())) {
    score += food.points;
    scoreText.setText('Score: ' + score);
    placeFood();
    checkCoinSpawn(this);
  } else if (coin.visible && Phaser.Geom.Intersects.RectangleToRectangle(newHead.getBounds(), coin.getBounds())) {
    score += 15;
    scoreText.setText('Score: ' + score);
    coin.visible = false;
    coin.x = -100;
    coin.y = -100;
    if (coinTimer) coinTimer.remove(false);
  } else {
    const tail = snake.pop();
    snakeGroup.remove(tail, true, true);
  }
}

function update() {
  if (cursors.left.isDown) newDirection = 'LEFT';
  else if (cursors.right.isDown) newDirection = 'RIGHT';
  else if (cursors.up.isDown) newDirection = 'UP';
  else if (cursors.down.isDown) newDirection = 'DOWN';
}

function placeFood() {
  const foodX = Phaser.Math.Between(1, 48) * 16;
  const foodY = Phaser.Math.Between(1, 36) * 16;
  food.x = foodX;
  food.y = foodY;

  if (score >= 100) {
    food.fillColor = 0x800080; // purple
    food.points = 3;
  } else if (score >= 30) {
    food.fillColor = 0xffa500; // orange
    food.points = 2;
  } else {
    food.fillColor = 0xff0000; // red
    food.points = 1;
  }
}

function checkCoinSpawn(scene) {
  if (score >= coinSpawnScore && !coinActive) {
    coinActive = true;
    spawnCoin(scene);

    scene.time.delayedCall(15000, () => {
      coin.visible = false;
      coin.x = -100;
      coin.y = -100;
      coinActive = false;
      coinSpawnScore += 30;
    }, [], scene);
  }
}

function spawnCoin(scene) {
  coin.visible = true;
  moveCoin();

  coinTimer = scene.time.addEvent({
    delay: 1000,
    callback: () => {
      if (coin.visible) moveCoin();
    },
    repeat: 14 // total of 15 seconds
  });
}

function moveCoin() {
  const coinX = Phaser.Math.Between(1, 48) * 16;
  const coinY = Phaser.Math.Between(1, 36) * 16;
  coin.x = coinX;
  coin.y = coinY;
}

function gameOver(scene) {
  scene.scene.restart();
  score = 0;
  coinActive = false;
  coinSpawnScore = 30;
}
