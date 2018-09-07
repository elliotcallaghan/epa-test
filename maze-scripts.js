const canvas = document.getElementById("canvas"),
      ctx = canvas.getContext("2d"),
      rectWidth = 11,
      rectHeight = 11,
      levels = [
          {image: "https://elliotcallaghan.co.uk/maze1.png", x: 1, y: 1, goalX: 176, goalY: 378},
          {image: "https://elliotcallaghan.co.uk/maze2.png", x: 1, y: 1, goalX: 302, goalY: 302},
          {image: "https://elliotcallaghan.co.uk/maze3.png", x: 1, y: 1, goalX: 352, goalY: 428},
      ];

let timer,
    interval = 1000,
    currentTime = 60,
    expected,
    currentLevel,
    pauseInterval,
    x,
    y;

//show maze and start timer
$("#start").on("click", function () {
    $("#start").hide();
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
    if (currentTime === 0) {
        $(document).on("keydown", togglePause);
    }
    $("#timer").text("Time remaining: 1:00");
    currentTime = 60;
    drawEverything();
});

//back to menu
$("#menu").on("click", function () {
    clearTimeout(timer);
    timer = null;
    $(document).off("keydown");
    $("input").hide();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    $("#start").show();
    currentTime = 60;
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
        ctx.fillRect(levels[currentLevel].goalX, levels[currentLevel].goalY, 22, 22);
        
        //set timer
        expected = Date.now() + interval;
        timer = setTimeout(countdown, interval);
    };
    mazeImage.onerror = function () {
        $(document).off("keydown");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = "20px serif";
        ctx.fillStyle = "rgb(255, 0, 0)";
        ctx.fillText("Image not found.", canvas.width / 2 - ctx.measureText("Image not found.").width / 2, canvas.height / 2);
    };
    mazeImage.crossOrigin = "anonymous";
    mazeImage.src = levels[currentLevel].image;
}

//repeatedly calls itself to create timer
function countdown() {
    let dt = Date.now() - expected;

    pauseInterval = Date.now();
    --currentTime;
    expected += interval;
    clearTimeout(timer);
    timer = null;

    if (currentTime.toString().length > 1) {
        $("#timer").text("Time remaining: 0:" + currentTime);
        timer = setTimeout(countdown, Math.max(0, interval - dt));
    } else {
        $("#timer").text("Time remaining: 0:0" + currentTime);
        timer = setTimeout(countdown, Math.max(0, interval - dt));
        if (currentTime === 0) {
            $(document).off("keydown");
            result("rgba(255, 255, 255, .8)");
            ctx.fillText("Time's up!", canvas.width / 2 - ctx.measureText("Time's up!").width / 2, canvas.height / 2);
            $("#menu, #retry").show();
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
                    clearTimeout(timer);
                    timer = null;
                    ++currentLevel;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    $("#timer").text("Time remaining: 1:00");
                    currentTime = 60;
                    drawEverything();
                } else {
                    $(document).off("keydown");
                    result("rgba(255, 255, 255, .8)");
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
            interval -= pauseInterval;
            drawEverything();
            interval = 1000;
        } else {
            pauseInterval -= Date.now();
            $(document).off("keydown", keyListener);
            result("rgb(255, 255, 255)");
            ctx.fillText("Paused", canvas.width / 2 - ctx.measureText("Paused").width / 2, canvas.height / 2);
            $("#menu, #retry").show();
        }
    }
}

//prepare success or fail screen
function result(colour) {
    clearTimeout(timer);
    timer = null;
    ctx.fillStyle = colour;
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
