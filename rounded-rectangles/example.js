var context = document.getElementById('canvas').getContext('2d');
var mask = document.getElementById('mask-canvas').getContext('2d');
// Functions..........................................................
function drawDot(x, y) {
    mask.beginPath();
    mask.arc(x, y, 2, 0, 2*Math.PI, false);
    mask.stroke();
}
function roundedRect(cornerX, cornerY,
    width, height, cornerRadius) {
    if (width > 0) {
        context.moveTo(cornerX + cornerRadius, cornerY);
        drawDot(cornerX + cornerRadius, cornerY);
    } else {
        context.moveTo(cornerX - cornerRadius, cornerY);
        context.arc(cornerX - cornerRadius, cornerY, 2, 0, 2*Math.PI, false);
    }
    // 1
    drawDot(cornerX + width, cornerY);
    drawDot(cornerX + width, cornerY + height);
    context.arcTo(cornerX + width, cornerY,
        cornerX + width, cornerY + height,
        cornerRadius);
    context.stroke();

    // 2
    drawDot(cornerX + width, cornerY + height);
    drawDot(cornerX, cornerY + height);
    context.arcTo(cornerX + width, cornerY + height,
        cornerX, cornerY + height,
        cornerRadius);
    context.stroke();

    // 3
    drawDot(cornerX, cornerY + height);
    drawDot(cornerX, cornerY);
    context.arcTo(cornerX, cornerY + height,
        cornerX, cornerY,
        cornerRadius);
    context.stroke();

    // 4
    drawDot(cornerX, cornerY);
    drawDot(cornerX + cornerRadius, cornerY);
    context.arcTo(cornerX, cornerY,
        cornerX + cornerRadius, cornerY,
        cornerRadius);
    context.stroke();
}
function drawRoundedRect(strokeStyle, fillStyle, cornerX, cornerY,
    width, height, cornerRadius) {
    context.beginPath();
    roundedRect(cornerX, cornerY, width, height, cornerRadius);
    context.strokeStyle = strokeStyle;
    context.fillStyle = fillStyle;
    context.stroke();
    // context.fill();
}
// Initialization................................................
let width = 100;
let gap = 20;
drawRoundedRect('blue', 'yellow', width, 40, 100, 100, 10);
drawRoundedRect('purple', 'green', width * 2 + gap, 40, 100, 100, 20);
drawRoundedRect('red', 'white', width * 3 + gap * 2, 40, 100, 100, 30);
drawRoundedRect('white', 'blue', width * 4 + gap * 3, 40, 100, 100, 40);
