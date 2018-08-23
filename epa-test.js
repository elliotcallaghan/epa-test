//https://hereandabove.com/maze/mazeorig.form.html

const canvas = document.getElementById("canvas"),
      ctx = canvas.getContext("2d"),
      rectWidth = 10,
      rectHeight = 10,
      interval = 1000,
      levels = [
          {image: "https://elliotcallaghan.co.uk/maze.svg", x: 1, y: 1, goalX: 120, goalY: 1},
          {image: "https://elliotcallaghan.co.uk/maze2.jpg", x: 1, y: 1, goalX: 185, goalY: 285},
          {image: "https://elliotcallaghan.co.uk/maze3.svg", x: 1, y: 1, goalX: 120, goalY: 1},
      ];

let timer,
    currentTime,
    expected = Date.now() + interval,
    currentLevel = 0,
    x = levels[currentLevel].x,
    y = levels[currentLevel].y;

//show maze and start timer
$("#start").on("click", function () {
    $(this).css("display", "none");
    $(document).on("keydown", keyListener);
    drawEverything();
});

//reset position and timer
$("#retry").on("click", function () {
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    $(this).css("display", "none");
    $(document).on("keydown", keyListener);
    $("#timer").text("Time remaining: 1:00");
    drawEverything();
});

//back to menu
$("#menu").on("click", function () {
    $(this).css("display", "none");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    $(document).off("keydown", keyListener);
    $("#start").css("display", "block");
    $("#timer").text("Time remaining: 1:00");
});

//load maze and draw rectangle and goal
function drawEverything() {
    let mazeImage = new Image();
    //clearTimeout(timer);
    $("#timer").text("Time Remaining: 1:00");
    currentTime = 60;
    countdown();
    mazeImage.onload = function () {
        ctx.drawImage(mazeImage, 0, 0, 300, 300);

        ctx.fillStyle = "rgb(0, 0, 255)";
        x = levels[currentLevel].x;
        y = levels[currentLevel].y;
        ctx.fillRect(x, y, rectWidth, rectHeight);

        ctx.fillStyle = "rgba(0, 128, 0, .5)";
        ctx.fillRect(levels[currentLevel].goalX, levels[currentLevel].goalY, 15, 15);
    };
    mazeImage.crossOrigin = "anonymous";
    mazeImage.src = levels[currentLevel].image;
}

//loads timer
function countdown() {
    let dt = Date.now() - expected;

    --currentTime;
    expected += interval;
    timer = setTimeout(countdown, Math.max(0, interval - dt));

    if (currentTime.toString().length > 1) {
        $("#timer").text("Time remaining: 0:" + currentTime);
    } else {
        $("#timer").text("Time remaining: 0:0" + currentTime);
        if (currentTime === 0) {
            result();
            ctx.fillText("Time's up!", canvas.width / 2 - ctx.measureText("Time's up!").width / 2, canvas.height / 2);
            $("#retry").css("display", "block");
        }
    }
}

//checks if future pixel location will be on a wall or the goal
function checkCollision(newX, newY) {
    if (newX > 0 && newY > 0 && newX < (canvas.width - rectWidth) && newY < (canvas.height - rectHeight)) {
        let pix = ctx.getImageData(newX, newY, 10, 10).data,
            collision = 3,
            i = 0;

        for (i; i < 4 * rectWidth * rectHeight; i += 4) {
            if (pix[i] === 0 && pix[i + 1] === 0 && pix[i + 2] === 0 && pix[i + 3]) {
                collision = 1; //moving into a wall
                break;
            } else if (pix[i] === 0 && pix[i + 1] === 128 && pix[i + 2] === 0 && pix[i + 3]) {
                collision = 2; //moving into the goal
                break;
            }
        }

        if (collision === 2 || collision === 3) {
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.fillRect(x, y, rectWidth, rectHeight);
            x = newX;
            y = newY;
            ctx.fillStyle = "rgb(0, 0, 255)";
            ctx.fillRect(x, y, rectWidth, rectHeight);
            if (collision === 2) { //goal reached
                if (currentLevel !== 2) { //if on last level(3)
                    currentLevel++;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    drawEverything();
                } else {
                    result();
                    ctx.fillText("Success!", canvas.width / 2 - ctx.measureText("Success!").width / 2, canvas.height / 2);
                    $("#menu").css("display", "block");
                }
            }
        }
    }
}

//prepare success or fail screen
function result() {
    clearTimeout(timer);
    $(document).off("keydown", keyListener);
    ctx.fillStyle = "rgba(255, 255, 255, .8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "35px serif";
    ctx.fillStyle = "rgb(0, 0, 0)";
}

//direction button and wasd event listeners
function keyListener(e) {
    switch (e.key) {
    case "ArrowUp":
    case "w":
        checkCollision(x, y - 5);
        break;
    case "ArrowDown":
    case "s":
        checkCollision(x, y + 5);
        break;
    case "ArrowLeft":
    case "a":
        checkCollision(x - 5, y);
        break;
    case "ArrowRight":
    case "d":
        checkCollision(x + 5, y);
        break;
    }
}