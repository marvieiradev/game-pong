const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const paddleWidth = 18;
const paddleHeight = 120;
const paddleSpeed = 8;
const ballRadius = 12;
const initialBallSpeed = 8;
const maxBallSpeed = 40;
const netWidth = 5;
const netColor = "WHITE";

//Desenha a rede no canvas
function drawNet() {
    for (let i = 0; i < canvas.height; i += 15) {
        drawRect(canvas.width / 2 - netWidth, i, netWidth, 10, netColor);
    }
}

//Desenha o retangulo no canvas
function drawRect(x, y, width, height, color) {
    context.fillStyle = color;
    context.fillRect(x, y, width, height)
}

//Desenha o circulo no canvas
function drawCircle(x, y, radius, color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2, false);
    context.closePath();
    context.fill();
}

//Desena o texto no canvas
function drawText(text, x, y, color, fontSize = 60, fontWeight = 'bold', font = "Courier New") {
    context.fillStyle = color;
    context.font = `${fontSize}px ${font}`;
    context.textAlign = "center";
    context.fillText(text, x, y);
}

//Criar a o objeto palheta (plataforma)
function createPaddle(x, y, width, height, color) {
    return { x, y, width, height, color, score: 0 };
}

//Criar o objeto bola
function createBall(x, y, radius, velocityX, velocityY, color) {
    return { x, y, radius, velocityX, velocityY, color, speed: initialBallSpeed };
}

//Definição das plataformas do jogador e cpu
const player = createPaddle(0, canvas.height / 2 - paddleHeight / 2, paddleWidth, paddleHeight, "WHITE");
const cpu = createPaddle(canvas.width - paddleWidth, canvas.height / 2 - paddleHeight / 2, paddleWidth, paddleHeight, "WHITE");

//Definição da bola
const ball = createBall(canvas.width / 2, canvas.height / 2, ballRadius, initialBallSpeed, initialBallSpeed, "WHITE");

//Atualiza a posição da plataforma do jogador baseado no movimento do mouse
canvas.addEventListener("mousemove", movePaddle);
function movePaddle(event) {
    const rect = canvas.getBoundingClientRect();
    player.y = event.clientY - rect.top - player.height / 2;
}

//Verifica se houve colisão entre a bola e a plataforma
function collision(b, p) {
    return (
        b.x + b.radius > p.x && b.x - b.radius < p.x + p.width && b.y + b.radius > p.y && b.y - b.radius < p.y + p.height
    );
}

//Reseta a posição e velocidade da bola
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = Math.random() * (canvas.height - ball.radius * 2) + ball.radius;
    ball.velocityX = -ball.velocityX;
    ball.speed = initialBallSpeed;
}

//Atualização da logica do jogo
function update() {
    //Verifica a pontuação e reseta a bola se necessário
    if (ball.x - ball.radius < 0) {
        cpu.score++;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        player.score++;
        resetBall();
    }

    //Atualiza a posição da bola
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    //Atualiza a plataforma da CPU baseada na posição da bola
    cpu.y += (ball.y - (cpu.y + cpu.height / 2)) * 0.1;

    //Teto e chão
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.velocityY = - ball.velocityY;
    }

    //Determina em que local a plataforma colidiu com a bola e muda o nagulo do movimento da bola
    let user = ball.x + ball.radius < canvas.width / 2 ? player : cpu;

    if (collision(ball, user)) {
        const collidePoint = ball.y - (user.y + user.height / 2);
        const collisionAngle = (Math.PI / 4) * (collidePoint / (user.height / 2));
        const direction = ball.x + ball.radius < canvas.width / 2 ? 1 : -1;
        ball.velocityX = direction * ball.speed + Math.cos(collisionAngle);
        ball.velocityY = ball.speed * Math.sin(collisionAngle);

        //Aumenta a velicidade da bola até o limite máximo
        ball.speed += 0.2;
        if (ball.speed > maxBallSpeed) {
            ball.speed = maxBallSpeed;
        }
    }
}

//Renderiza o jogo no canvas
function render() {
    //Limpa o canvas com um tela preta
    drawRect(0, 0, canvas.width, canvas.height, "BLACK");
    drawNet();
    //Desenha as pontuações
    drawText(player.score, canvas.width / 4, canvas.height / 2, "GRAY", 120, 'bold');
    drawText(cpu.score, (3 * canvas.width) / 4, canvas.height / 2, "GRAY", 120, 'bold');

    //Desenha as plataformas
    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(cpu.x, cpu.y, cpu.width, cpu.height, cpu.color);

    //Desenha a bola
    drawCircle(ball.x, ball.y, ball.radius, ball.color);

}

//Inicia o loop do jogo
function gameLoop() {
    update();
    render();
}

//Faz o loop do jogo executar a 60 FPS
const fps = 60;
setInterval(gameLoop, 1000 / fps);
