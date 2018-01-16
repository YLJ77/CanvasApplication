var context = document.getElementById('canvas').getContext('2d');

function drawGrid(context, color, stepx, stepy) {
    context.strokeStyle = color;
    context.lineWidth = 0.5;

    for (var i = stepx + 0.5; i < context.canvas.width; i += stepx) {
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i, context.canvas.height);
        context.stroke();
    }

    for (var i = stepy + 0.5; i < context.canvas.height; i += stepy) {
        context.beginPath();
        context.moveTo(0, i);
        context.lineTo(context.canvas.width, i);
        context.stroke();
    }
}

function draw() {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    drawGrid(context, 'lightgray', 10, 10);
    context.save();

    context.shadowColor = 'rgba(200, 200, 0, 0.5)';
    context.shadowOffsetX = 12;
    context.shadowOffsetY = 12;
    context.shadowBlur = 15;

    drawCutouts();
    strokeCutoutShapes();
    context.restore();
}

function drawCutouts() {
    context.beginPath();
    addOuterRectanglePath();   //CW

    addCirclePath();  //CCW
    addRectanglePath();  //CCW
    addTrianglePath();  //CCW

    context.fill();  //Cut out shapes
}

function strokeCutoutShapes() {
    context.save();
    context.strokeStyle = 'rgba(0, 0, 0, 0.7)';

    context.beginPath();
    addOuterRectanglePath();  //CW
    context.stroke();

    context.beginPath();
    addCirclePath();
    addRectanglePath();
    addTrianglePath();
    context.stroke();

    context.restore();
}

function rect(x, y, w, h, direction) {
    if (direction) { //CCW
        context.moveTo(x, y);
        context.lineTo(x, y + h);
        context.lineTo(x + w, y + h);
        context.lineTo(x + w, y);
        context.closePath();
    } else {
        context.moveTo(x, y);
        context.lineTo(x + w, y);
        context.lineTo(x + w, y + h);
        context.lineTo(x, y + h);
        context.closePath();
    }
}

function addOuterRectanglePath() {
    context.rect(110, 25, 370, 335);
}

function addCirclePath() {
    context.arc(300, 300, 40, 0, Math.PI*2, true);
}

function addRectanglePath() {
    rect(310, 55, 70, 35, true);
}

function addTrianglePath() {
    context.moveTo(400, 200);
    context.lineTo(250, 115);
    context.lineTo(200, 200);
    context.closePath();
}

context.fillStyle = 'goldenrod';
draw();
