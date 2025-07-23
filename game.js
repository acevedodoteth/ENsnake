class SnakeGame extends Phaser.Scene {
  constructor() {
    super({ key: 'SnakeGame' });
    this.gridSize = 16;  // Size of each cell
  }

  preload() {}

  create() {
    this.snake = [{ x: 8, y: 8 }]; // initial snake position (grid coords)
    this.direction = 'RIGHT';
    this.nextDirection = 'RIGHT'; // buffer next direction for smooth control
    this.speed = 150; // movement speed in ms
    this.timer = 0;
    this.score = 0;

    this.food = this.placeFood();

    // Display score text
    this.scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '20px', fill: '#fff' });

    // Keyboard controls
    this.cursors = this.input.keyboard.createCursorKeys();

    this.gameOver = false;
  }

  placeFood() {
    let foodX, foodY;
    do {
      foodX = Phaser.Math.Between(0, 39);
      foodY = Phaser.Math.Between(0, 29);
    } while (this.snake.some(segment => segment.x === foodX && segment.y === foodY));

    return { x: foodX, y: foodY };
  }

  update(time) {
    if (this.gameOver) return;

    // Check input and update direction
    if (this.cursors.left.isDown && this.direction !== 'RIGHT') this.nextDirection = 'LEFT';
    else if (this.cursors.right.isDown && this.direction !== 'LEFT') this.nextDirection = 'RIGHT';
    else if (this.cursors.up.isDown && this.direction !== 'DOWN') this.nextDirection = 'UP';
    else if (this.cursors.down.isDown && this.direction !== 'UP') this.nextDirection = 'DOWN';

    if (time > this.timer) {
      this.timer = time + this.speed;
      this.moveSnake();
    }

    this.draw();
  }

  moveSnake() {
    this.direction = this.nextDirection;

    const head = { ...this.snake[0] };

    switch (this.direction) {
      case 'LEFT': head.x -= 1; break;
      case 'RIGHT': head.x += 1; break;
      case 'UP': head.y -= 1; break;
      case 'DOWN': head.y += 1; break;
    }

    // Check collision with walls
    if (head.x < 0 || head.x >= 40 || head.y < 0 || head.y >= 30) {
      this.endGame();
      return;
    }

    // Check collision with self
    if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      this.endGame();
      return;
    }

    // Add new head to snake
    this.snake.unshift(head);

    // Check if food eaten
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.scoreText.setText('Score: ' + this.score);
      this.food = this.placeFood();
      // Snake grows: do not remove tail
    } else {
      // Remove tail segment if no food eaten (snake moves forward)
      this.snake.pop();
    }
  }

  draw() {
    this.clearGraphics();

    this.graphics = this.graphics || this.add.graphics();

    // Draw food
    this.graphics.fillStyle(0xff0000, 1);
    this.graphics.fillRect(this.food.x * this.gridSize, this.food.y * this.gridSize, this.gridSize, this.gridSize);

    // Draw snake
    this.graphics.fillStyle(0x00ff00, 1);
    this.snake.forEach(segment => {
      this.graphics.fillRect(segment.x * this.gridSize, segment.y * this.gridSize, this.gridSize, this.gridSize);
    });
  }

  clearGraphics() {
    if (this.graphics) this.graphics.clear();
  }

  endGame() {
    this.gameOver = true;
    this.add.text(200, 200, 'Game Over', { fontSize: '40px', fill: '#fff' });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 640,  // 40 cells * 16 pixels
  height: 480, // 30 cells * 16 pixels
  scene: SnakeGame,
  backgroundColor: '#000',
};

const game = new Phaser.Game(config);
