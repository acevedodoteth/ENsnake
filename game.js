// Updated Phaser Snake Game with Obstacles, Color Progression, Gold Coin Bonus, Speed Scaling, and Sound Effects
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
let moveInterval = 150;
let goldCoin;
let goldCoinTimer = null;
let lastSpeedLevel = 0;
let lastColorPoints = 1;
let staticObstacles;
let movingObstacles;
let patrolTween;

function preload() {
  this.load.audio('swoosh', 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg');
  this.load.audio('levelup', 'https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg');
}

function create() {
  this.swooshSound = this.sound.add('swoosh');
  this.levelUpSound = this.sound.add('levelup');

  snake = this.physics.add.group();
  for (let i = 0; i < 3; i++) {
    let segment = this.add.rectangle(160 - i * 16, 300, 16, 16, 0x00ff00);
    this.physics.add.existing(segment);
    segment.body.setCollideWorldBounds(true);
    segment.body.setImmovable(true);
    segment.setOrigin(0);
    snake.add(segment);
  }

  food = this.add.rectangle(0, 0, 16, 16, 0xff0000);
  this.physics.add.existing(food);
  food.body.setImmovable(true);

  cursors = this.input.keyboard.createCursorKeys();
  scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '20px', fill: '#ffffff' });

  staticObstacles = this.physics.add.staticGroup();
  movingObstacles = this.add.group();

  placeFood.call(this);
}

function update(time) {
  updateSpeed.call(this);

  if (time < moveTimer) return;
  moveTimer = time + moveInterval;

  if (cursors.left.isDown && lastDirection !== 'RIGHT') direction = 'LEFT';
  else if (cursors.right.isDown && lastDirection !== 'LEFT') direction = 'RIGHT';
  else if (cursors.up.isDown && lastDirection !== 'DOWN') direction = 'UP';
  else if (cursors.down.isDown && lastDirection !== 'UP') direction = 'DOWN';

  const segments = snake.getChildren();
  const head = segments[0];
  let newX = head.x;
  let newY = head.y;

  if (direction === 'LEFT') newX -= 16;
  else if (direction === 'RIGHT') newX += 16;
  else if (direction === 'UP') newY -= 16;
  else if (direction === 'DOWN') newY += 16;

  if (newX < 0 || newX >= 800 || newY < 0 || newY >= 600) return restartScene.call(this);

  for (let i = 1; i < segments.length; i++) {
    if (segments[i].x === newX && segments[i].y === newY) return restartScene.call(this);
  }

  const tail = segments.pop();
  tail.x = newX;
  tail.y = newY;
  segments.unshift(tail);
  lastDirection = direction;

  if (Phaser.Geom.Intersects.RectangleToRectangle(tail.getBounds(), food.getBounds())) {
    growSnake.call(this);
    updateScore.call(this);
    placeFood.call(this);
  }

  if (goldCoin && Phaser.Geom.Intersects.RectangleToRectangle(tail.getBounds(), goldCoin.getBounds())) {
    score += 15;
    scoreText.setText('Score: ' + score);
    goldCoin.destroy();
    goldCoin = null;
    if (goldCoinTimer) clearTimeout(goldCoinTimer);
  }

  this.physics.world.collide(snake, staticObstacles, () => restartScene.call(this));
  movingObstacles.getChildren().forEach(ob => {
    if (Phaser.Geom.Intersects.RectangleToRectangle(tail.getBounds(), ob.getBounds())) {
      restartScene.call(this);
    }
  });
}

function restartScene() {
  this.scene.restart();
  score = 0;
  direction = 'RIGHT';
  lastDirection = 'RIGHT';
  lastSpeedLevel = 0;
  lastColorPoints = 1;
}

function updateSpeed() {
  const level = Math.floor(score / 10);
  const newInterval = Math.max(55, 150 - level * 10);
  if (level > lastSpeedLevel) {
    this.swooshSound.play();
    lastSpeedLevel = level;
  }
  moveInterval = newInterval;
}

function placeFood() {
  const colorThresholds = [
    { max: 29, color: 0xff0000, points: 1 },
    { max: 89, color: 0xffa500, points: 2 },
    { max: 179, color: 0xffff00, points: 3 },
    { max: 299, color: 0x00ff00, points: 4 },
    { max: 449, color: 0x0000ff, points: 5 },
    { max: 629, color: 0x800080, points: 6 },
    { max: 899, color: 0xff69b4, points: 7 },
    { max: 1199, color: 0xffffff, points: 10 }
  ];

  const tier = colorThresholds.find(t => score <= t.max) || colorThresholds[colorThresholds.length - 1];
  food.fillColor = tier.color;
  food.points = tier.points;

  if (tier.points > lastColorPoints) {
    this.levelUpSound.play();
    lastColorPoints = tier.points;
  }

  food.x = Phaser.Math.Snap.To(Phaser.Math.Between(1, 48) * 16, 16);
  food.y = Phaser.Math.Snap.To(Phaser.Math.Between(1, 36) * 16, 16);

  if (score > 0 && score % 30 === 0 && !goldCoin) {
    spawnGoldCoin.call(this);
    spawnStaticObstacle.call(this);
  }

  if (score > 0 && score % 60 === 0) {
    spawnMovingObstacle.call(this);
  }
}

function spawnGoldCoin() {
  goldCoin = this.add.rectangle(0, 0, 16, 16, 0xFFD700);
  this.physics.add.existing(goldCoin);
  goldCoin.body.setImmovable(true);

  const moveCoin = () => {
    if (!goldCoin) return;
    goldCoin.x = Phaser.Math.Snap.To(Phaser.Math.Between(1, 48) * 16, 16);
    goldCoin.y = Phaser.Math.Snap.To(Phaser.Math.Between(1, 36) * 16, 16);
  };

  moveCoin();
  const moveInterval = setInterval(moveCoin, 1000);

  goldCoinTimer = setTimeout(() => {
    if (goldCoin) goldCoin.destroy();
    goldCoin = null;
    clearInterval(moveInterval);
  }, 15000);
}

function spawnStaticObstacle() {
  const wall = this.add.rectangle(
    Phaser.Math.Snap.To(Phaser.Math.Between(1, 48) * 16, 16),
    Phaser.Math.Snap.To(Phaser.Math.Between(1, 36) * 16, 16),
    16, 16, 0x777777
  );
  staticObstacles.add(wall);
}

function spawnMovingObstacle() {
  const cop = this.add.rectangle(
    Phaser.Math.Snap.To(Phaser.Math.Between(1, 48) * 16, 16),
    Phaser.Math.Snap.To(Phaser.Math.Between(1, 36) * 16, 16),
    16, 16, 0x0000ff
  );
  this.physics.add.existing(cop);
  movingObstacles.add(cop);

  this.tweens.add({
    targets: cop,
    x: cop.x + 64,
    duration: 1000,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
    onUpdate: () => {
      cop.fillColor = cop.fillColor === 0x0000ff ? 0xff0000 : 0x0000ff;
    }
  });
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
  newSegment.body.setCollideWorldBounds(true);
  newSegment.body.setImmovable(true);
  newSegment.setOrigin(0);
  snake.add(newSegment);
}
