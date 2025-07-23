const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

let snake;
let food;
let cursors;
let score = 0;
let scoreText;
let direction = 'RIGHT';
let lastDirection = 'RIGHT';
let moveTimer = 0;

function preload() {
  // No assets to load
}

function create() {
  snake = this.add.group();

  // Create 3 initial segments
  for (let i = 0; i < 3; i++) {
    let segment = this.add.rectangle(160 - i * 16, 300, 16, 16, 0x00ff00);
    this.physics.add.existing(segment);
    segment.setOrigin(0);
    snake.add(segment);
  }

  // Create food
  food = this.add.rectangle(0, 0, 16, 16, 0xff0000);
  this.physics.add.existing(food);
  food.setOrigin(0);
  placeFood();

  cursors = this.input.keyboard.createCursorKeys();

  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  });
}

function update(time) {
  if (time < moveTimer) return;
  moveTimer = time + 100;

  const segments = snake.getChildren();
  const head = segments[0];
  let newX = head.x;
  let newY = head.y;

  // Input control
  if (cursors.left.isDown && lastDirection !== 'RIGHT') direction = 'LEFT';
  else if (cursors.right.isDown && lastDirection !== 'LEFT') direction = 'RIGHT';
  else if (cursors.up.isDown && lastDirection !== 'DOWN') direction = 'UP';
  else if (cursors.down.isDown && lastDirection !== 'UP') direction = 'DOWN';

  if (direction === 'LEFT') newX -= 16;
  else if (direction === 'RIGHT') newX += 16;
  else if (direction === 'UP') newY -= 16;
  else if (direction === 'DOWN') newY += 16;

  // Wall collision
  if (newX < 0 || newX >= 800 || newY < 0 || newY >= 600) {
    this.scene.restart();
    score = 0;
    direction = 'RIGHT';
    lastDirection = 'RIGHT';
    return;
  }

  // Self collision
  for (let i = 1; i < segments.length; i++) {
    if (segments[i].x === newX && segments[i].y === newY) {
      this.scene.restart();
      score = 0;
      direction = 'RIGHT';
      lastDirection = 'RIGHT';
      return;
    }
  }

  // Move snake: shift body segments forward
  for (let i = segments.length - 1; i > 0; i--) {
    segments[i].x = segments[i - 1].x;
    segments[i].y = segments[i - 1].y;
  }

  // Move head
  head.x = newX;
  head.y = newY;
  lastDirection = direction;

  // Food collision
  if (Phaser.Geom.Intersects.RectangleToRectangle(head.getBounds(), food.getBounds())) {
    growSnake.call(this);
    updateScore.call(this);
    placeFood.call(this);
  }
}

function placeFood() {
  let foodX = Phaser.Math.Between(0, 49) * 16;
  let foodY = Phaser.Math.Between(0, 37) * 16;

  food.x = foodX;
  food.y = foodY;

  if (score >= 100) {
    food.fillColor = 0x800080;
    food.points = 3;
  } else if (score >= 30) {
    food.fillColor = 0xffa500;
    food.points = 2;
  } else {
    food.fillColor = 0xff0000;
    food.points = 1;
  }
}

function updateScore() {
  score += food.points || 1;
  scoreText.setText('Score: ' + score);
}

function growSnake() {
  const segments = snake.getChildren();
  const tail = segments[segments.length - 1];

  let newSegment = this.add.rectangle(tail.x, tail.y, 16, 16, 0x00ff00);
  this.physics.add.existing(newSegment);
  newSegment.setOrigin(0);
  snake.add(newSegment);
}
