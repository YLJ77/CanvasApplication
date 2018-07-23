var context = document.getElementById('canvas').getContext('2d');
// Functions.....................................................
function drawTwoArcs() {
    context.beginPath();
    context.arc(300, 190, 150, 0, Math.PI*2, false); // Outer: CCW
    context.arc(300, 190, 100, 0, Math.PI*2, true); // Inner: CW
    context.fill();
    context.shadowColor = undefined;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    // context.stroke();
}
function draw() {
    context.clearRect(0, 0, context.canvas.width,
        context.canvas.height);
    context.save();
    context.shadowColor = 'rgba(0,0,0,0.8)';
    context.shadowOffsetX = 12;
    context.shadowOffsetY = 12;
    context.shadowBlur = 15;
    drawTwoArcs();
    context.restore();
}
// Initialization................................................
context.fillStyle = 'rgba(100,140,230,0.5)';
context.strokeStyle = context.fillStyle;
draw();
