const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let fishX = canvas.width / 2;
const fishY = canvas.height - 50;
const fishSpeed = 5;

const bulletSpeed = 7;
const bubbleSpeed = 2;

let bullets = [];
let bubbles = [];

let score = 0;
let highScore = 0;
let lives = 3;
let canShoot = true;

let question = '';
let correctAnswer = 0;
let choices = [];

function generateQuestion() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ['+', '-', '*'];
    const op = operators[Math.floor(Math.random() * operators.length)];
    question = `${num1} ${op} ${num2}`;
    correctAnswer = eval(question);
    choices = Array.from(new Set([correctAnswer, correctAnswer + Math.floor(Math.random() * 10 - 5), correctAnswer + Math.floor(Math.random() * 10 - 5), correctAnswer + Math.floor(Math.random() * 10 - 5)]));
    choices.sort(() => Math.random() - 0.5);
}

function resetGame() {
    fishX = canvas.width / 2;
    score = 0;
    lives = 3;
    bullets = [];
    bubbles = [];
    generateQuestion();
}

function drawFish() {
    ctx.beginPath();
    ctx.moveTo(fishX, fishY);
    ctx.lineTo(fishX - 15, fishY + 25);
    ctx.lineTo(fishX + 15, fishY + 25);
    ctx.closePath();
    ctx.fillStyle = 'white';
    ctx.fill();
}

function drawBullet(bullet) {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();
}

function drawBubble(bubble) {
    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, 25, 0, Math.PI * 2);
    ctx.fillStyle = 'blue';
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(bubble.value, bubble.x - 10, bubble.y + 5);
}

function moveFish() {
    document.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowLeft' && fishX > 25) {
            fishX -= fishSpeed;
        } else if (event.key === 'ArrowRight' && fishX < canvas.width - 25) {
            fishX += fishSpeed;
        } else if (event.key === ' ' && canShoot) {
            bullets.push({ x: fishX, y: fishY });
            canShoot = false;
        }
    });

    document.addEventListener('keyup', function(event) {
        if (event.key === ' ') {
            canShoot = true;
        }
    });
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawFish();

    // Move and draw bullets
    bullets.forEach((bullet, index) => {
        bullet.y -= bulletSpeed;
        drawBullet(bullet);
        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });

    // Spawn bubbles
    if (bubbles.length === 0) {
        const positions = [canvas.width / 5, 2 * canvas.width / 5, 3 * canvas.width / 5, 4 * canvas.width / 5];
        positions.sort(() => Math.random() - 0.5);
        bubbles = positions.map((pos, index) => ({ x: pos, y: 0, value: choices[index] }));
    }

    // Move and draw bubbles
    bubbles.forEach((bubble, index) => {
        bubble.y += bubbleSpeed;
        drawBubble(bubble);
        if (bubble.y > canvas.height) {
            bubbles.splice(index, 1);
            lives -= 1;
            if (lives === 0) {
                gameOver();
            }
        }
    });

    // Bullet and bubble collision
    bullets.forEach((bullet, bulletIndex) => {
        bubbles.forEach((bubble, bubbleIndex) => {
            const dx = bullet.x - bubble.x;
            const dy = bullet.y - bubble.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 25) {
                if (bubble.value === correctAnswer) {
                    score += 1;
                    bubbles = [];
                    generateQuestion();
                } else {
                    lives -= 1;
                    if (lives === 0) {
                        gameOver();
                    }
                }
                bullets.splice(bulletIndex, 1);
                bubbles.splice(bubbleIndex, 1);
            }
        });
    });

    // Display question, score, high score, and lives
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`Question: ${question}`, 10, canvas.height - 20);
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`High Score: ${highScore}`, 10, 60);
    ctx.fillText(`Lives: ${lives}`, canvas.width - 100, 30);
}

function gameOver() {
    highScore = Math.max(score, highScore);
    ctx.fillStyle = 'white';
    ctx.font = '32px Arial';
    ctx.fillText('Game Over', canvas.width / 2 - 80, canvas.height / 2 - 50);
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2 - 40, canvas.height / 2);
    ctx.fillText(`High Score: ${highScore}`, canvas.width / 2 - 60, canvas.height / 2 + 30);
    ctx.fillText('Press R to Retry', canvas.width / 2 - 80, canvas.height / 2 + 60);

    document.addEventListener('keydown', function(event) {
        if (event.key === 'r') {
            resetGame();
        }
    });

    cancelAnimationFrame(animationId);
}

function gameLoop() {
    update();
    moveFish();
    animationId = requestAnimationFrame(gameLoop);
}

let animationId;
resetGame();
gameLoop();
