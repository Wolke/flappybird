// Model
class GameModel {
    constructor() {
        this.bird = { x: 50, y: 200, velocity: 0 };
        this.pipes = [];
        this.score = 0;
        this.gameOver = false;
    }

    update() {
        if (this.gameOver) return;

        // 更新鳥的位置
        this.bird.velocity += 0.5;
        this.bird.y += this.bird.velocity;

        // 生成新的管道
        if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < 250) {
            this.pipes.push({
                x: 400,
                topHeight: Math.random() * 200 + 50
            });
        }

        // 更新管道位置
        for (let pipe of this.pipes) {
            pipe.x -= 2;
        }

        // 移除離開畫面的管道
        if (this.pipes[0].x < -50) {
            this.pipes.shift();
            this.score++;
        }

        // 碰撞檢測
        for (let pipe of this.pipes) {
            if (
                this.bird.x + 30 > pipe.x && this.bird.x < pipe.x + 50 &&
                (this.bird.y < pipe.topHeight || this.bird.y + 30 > pipe.topHeight + 150)
            ) {
                this.gameOver = true;
            }
        }

        // 檢查是否撞到地面或天花板
        if (this.bird.y < 0 || this.bird.y > 570) {
            this.gameOver = true;
        }
    }

    jump() {
        this.bird.velocity = -8;
    }

    reset() {
        this.bird = { x: 50, y: 200, velocity: 0 };
        this.pipes = [];
        this.score = 0;
        this.gameOver = false;
    }
}

// View
class GameView {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 400;
        this.canvas.height = 600;
        this.scoreElement = document.getElementById('score-value');
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.finalScoreElement = document.getElementById('final-score');
        this.jumpButton = document.getElementById('jump-button');
    }

    draw(model) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 繪製鳥
        this.ctx.save();
        this.ctx.translate(model.bird.x, model.bird.y);
        this.ctx.rotate(model.bird.velocity * 0.1);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 20, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(7, -5, 12, 0, Math.PI * 2);
        this.ctx.fillStyle = 'white';
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(16, 0, 4, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FF6347';
        this.ctx.fill();
        this.ctx.restore();

        // 繪製管道
        this.ctx.fillStyle = '#228B22';
        this.ctx.strokeStyle = '#006400';
        this.ctx.lineWidth = 3;
        for (let pipe of model.pipes) {
            // 上方管道
            this.ctx.fillRect(pipe.x, 0, 50, pipe.topHeight);
            this.ctx.strokeRect(pipe.x, 0, 50, pipe.topHeight);
            this.ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, 60, 20);
            this.ctx.strokeRect(pipe.x - 5, pipe.topHeight - 20, 60, 20);

            // 下方管道
            this.ctx.fillRect(pipe.x, pipe.topHeight + 150, 50, 600 - pipe.topHeight - 150);
            this.ctx.strokeRect(pipe.x, pipe.topHeight + 150, 50, 600 - pipe.topHeight - 150);
            this.ctx.fillRect(pipe.x - 5, pipe.topHeight + 150, 60, 20);
            this.ctx.strokeRect(pipe.x - 5, pipe.topHeight + 150, 60, 20);
        }

        // 更新分數
        this.scoreElement.textContent = model.score;
    }

    showStartScreen() {
        this.startScreen.classList.remove('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.jumpButton.classList.add('hidden');
    }

    hideStartScreen() {
        this.startScreen.classList.add('hidden');
        this.jumpButton.classList.remove('hidden');
    }

    showGameOverScreen(score) {
        this.gameOverScreen.classList.remove('hidden');
        this.finalScoreElement.textContent = score;
        this.jumpButton.classList.add('hidden');
    }

    hideGameOverScreen() {
        this.gameOverScreen.classList.add('hidden');
    }
}

// Controller
class GameController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.isRunning = false;

        // 事件監聽器
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') this.jump();
        });

        document.getElementById('start-button').addEventListener('click', () => this.startGame());
        document.getElementById('restart-button').addEventListener('click', () => this.startGame());
        this.view.jumpButton.addEventListener('click', () => this.jump());

        this.view.showStartScreen();
    }

    startGame() {
        this.model.reset();
        this.view.hideStartScreen();
        this.view.hideGameOverScreen();  // 新增這行
        this.isRunning = true;
        this.gameLoop();
    }

    gameLoop() {
        if (!this.isRunning) return;

        this.model.update();
        this.view.draw(this.model);

        if (this.model.gameOver) {
            this.isRunning = false;
            this.view.showGameOverScreen(this.model.score);
        } else {
            requestAnimationFrame(() => this.gameLoop());
        }
    }

    jump() {
        if (this.isRunning) {
            this.model.jump();
        }
    }
}

// 初始化遊戲
const game = new GameController(new GameModel(), new GameView());