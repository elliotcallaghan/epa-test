//https://hereandabove.com/maze/mazeorig.form.html

const canvas = document.getElementById("canvas"),
      ctx = canvas.getContext("2d"),
      rectWidth = 10,
      rectHeight = 10,
      interval = 1000,
      levels = [
          {image: "https://elliotcallaghan.co.uk/maze1.png", x: 1, y: 1, goalX: 30, goalY: 1},
          {image: "https://elliotcallaghan.co.uk/maze2.png", x: 1, y: 1, goalX: 30, goalY: 1},
          {image: "https://elliotcallaghan.co.uk/maze3.png", x: 1, y: 1, goalX: 30, goalY: 1},
      ];

let timer,
    currentTime,
    expected,
    currentLevel,
    x,
    y;

//show maze and start timer
$("#start").on("click", function () {
    $(this).hide();
    $(document).on("keydown", keyListener);
    $(document).on("keydown", togglePause);
    drawEverything();
});

//reset position and timer
$("#retry").on("click", function () {
    $("input").hide();
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    $(document).on("keydown", keyListener);
    $(document).on("keydown", keyListener);
    $("#timer").text("Time remaining: 1:00");
    drawEverything();
});

//back to menu
$("#menu").on("click", function () {
    clearTimeout(timer);
    timer = null;
    $("input").hide();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    $(document).off("keydown");
    $("#start").show();
    $("#timer").text("Time remaining: 1:00");
    loadMenu();
});

//loads main menu
function loadMenu() {
    currentLevel = 0;
    $("#start").show();
    ctx.font = "45px serif";
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillText("Maze Game", canvas.width / 2 - ctx.measureText("Maze Game").width / 2, canvas.height / 4);
    ctx.font = "20px serif";
    ctx.fillText("There are " + levels.length + " levels.",
                 canvas.width / 2 - ctx.measureText("There are " + levels.length + " levels.").width / 2, canvas.height * 0.4);
    ctx.fillText("You have 1 minute to complete each.",
                 canvas.width / 2 - ctx.measureText("You have 1 minute to complete each.").width / 2, canvas.height / 2);
    ctx.fillText("Click start to begin.",
                 canvas.width / 2 - ctx.measureText("Click start to begin.").width / 2, canvas.height * 0.6);
}

//load maze, draw controllable object and goal, and set timer
function drawEverything() {
    let mazeImage = new Image();
    mazeImage.onload = function () {
        //draw the maze
        ctx.drawImage(mazeImage, 0, 0, 500, 500);

        //draw the controllable object
        ctx.fillStyle = "rgb(0, 0, 255)";
        x = levels[currentLevel].x;
        y = levels[currentLevel].y;
        ctx.fillRect(x, y, rectWidth, rectHeight);

        //draw the goal
        ctx.fillStyle = "rgb(127, 191, 127)";
        ctx.fillRect(levels[currentLevel].goalX, levels[currentLevel].goalY, 15, 15);
        
        //set the timer
        $("#timer").text("Time Remaining: 1:00");
        currentTime = 60;
        expected = Date.now() + interval;
        countdown();
    };
    mazeImage.crossOrigin = "anonymous";
    mazeImage.src = levels[currentLevel].image;
}

//repeatedly calls itself to create timer
function countdown() {
    let dt = Date.now() - expected;

    --currentTime;
    expected += interval;
    clearTimeout(timer);
    timer = null;
    timer = setTimeout(countdown, Math.max(0, interval - dt)); 
    
    if (currentTime.toString().length > 1) {
        $("#timer").text("Time remaining: 0:" + currentTime);
    } else {
        $("#timer").text("Time remaining: 0:0" + currentTime);
        if (currentTime === 0) {
            $(document).off("keydown");
            result();
            ctx.fillText("Time's up!", canvas.width / 2 - ctx.measureText("Time's up!").width / 2, canvas.height / 2);
            $("#menu").show();
            $("#retry").show();
        }
    }
}

//checks if future pixel location will be on a wall or the goal
function checkCollision(newX, newY) {
    if (newX > 0 && newY > 0 && newX < (canvas.width - rectWidth) && newY < (canvas.height - rectHeight)) {
        let pixels = ctx.getImageData(newX, newY, rectWidth, rectHeight).data,
            collision = 3;

        for (let i = 0; i < 4 * rectWidth * rectHeight; i += 4) {
            if (pixels[i] === 0 && pixels[i + 1] === 0 && pixels[i + 2] === 0) {
                collision = 1; //moving into a wall
                break;
            } else if (pixels[i] === 127 && pixels[i + 1] === 191 && pixels[i + 2] === 127) {
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
                if (currentLevel + 1 !== levels.length) { //if not on last level
                    ++currentLevel;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    drawEverything();
                } else {
                    $(document).off("keydown");
                    result();
                    ctx.fillText("Success!", canvas.width / 2 - ctx.measureText("Success!").width / 2, canvas.height / 2);
                    $("#menu").show();
                }
            }
        }
    }
}

//if timer is running, pauses it, otherwise restarts it
function togglePause(e) {
    if (e.key === "Escape" || e.key === "p") {
        if (timer === null) {
            $("input").hide();
            $(document).on("keydown", keyListener);
            drawEverything();
            expected = Date.now() + interval;
            countdown();
        } else {
            $(document).off("keydown", keyListener);
            clearTimeout(timer);
            timer = null;
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = "35px serif";
            ctx.fillStyle = "rgb(0, 0, 0)";
            ctx.fillText("Paused", canvas.width / 2 - ctx.measureText("Paused").width / 2, canvas.height / 2);
            $("#menu").show();
            $("#retry").show();
        }
    }
}

//prepare success or fail screen
function result() {
    clearTimeout(timer);
    timer = null;
    ctx.fillStyle = "rgba(255, 255, 255, .8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "35px serif";
    ctx.fillStyle = "rgb(0, 0, 0)";
}

//directional buttons and wasd key event listeners
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

loadMenu();