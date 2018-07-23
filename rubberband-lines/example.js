let canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d'),
    eraseAllButton = document.getElementById('eraseAllButton'),
    strokeStyleSelect = document.getElementById('strokeStyleSelect'),
    guidewireCheckbox = document.getElementById('guidewireCheckbox'),
    fillCheckbox = document.getElementById('fillCheckbox'),
    drawingSurfaceImageData,
    mousedown = {},
    rubberbandRect = {},
    dragging = false,
    guidewires = guidewireCheckbox.checked;
// Functions..........................................................
function drawGrid(color, stepx, stepy) {
    context.save();
    context.strokeStyle = color;
    context.lineWidth = 0.5;
    for (let i = stepx + 0.5; i < context.canvas.width; i += stepx) {
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i, context.canvas.height);
        context.stroke();
    }
    for (let i = stepy + 0.5; i < context.canvas.height; i += stepy) {
        context.beginPath();
        context.moveTo(0, i);
        context.lineTo(context.canvas.width, i);
        context.stroke();
    }
    context.restore();
}
function windowToCanvas(x, y) {
    let bbox = canvas.getBoundingClientRect();
    return { x: x - bbox.left * (canvas.width / bbox.width),
        y: y - bbox.top * (canvas.height / bbox.height) };
}
// Save and restore drawing surface...................................
function saveDrawingSurface() {
    drawingSurfaceImageData = context.getImageData(0, 0,
        canvas.width,
        canvas.height);
}
function restoreDrawingSurface() {
    context.putImageData(drawingSurfaceImageData, 0, 0);
}
// Rubber bands.......................................................
function updateRubberbandRectangle(loc) {
    rubberbandRect.width = Math.abs(loc.x - mousedown.x);
    rubberbandRect.height = Math.abs(loc.y - mousedown.y);
    rubberbandRect.left = Math.min(mousedown.x, loc.x);
    rubberbandRect.top = Math.min(mousedown.y, loc.y);
}
function drawLine(loc) {
    context.beginPath();
    context.moveTo(mousedown.x, mousedown.y);
    context.lineTo(loc.x, loc.y);
    context.stroke();
}
function drawCircle(loc) {
    let angle,
        radius;
    if (mousedown.y === loc.y) { // Horizontal line
        radius = Math.abs(loc.x - mousedown.x);
    }
    else {
        /*
        angle = Math.atan(rubberbandRect.height/rubberbandRect.width),
            radius = rubberbandRect.height / Math.sin(angle);
            */
        let {height, width} = rubberbandRect;
        radius = Math.sqrt(height * height + width * width);
    }
    context.beginPath();
    context.arc(mousedown.x, mousedown.y, radius, 0, Math.PI*2, false);
    context.stroke();
    if (fillCheckbox.checked) {
        context.fill(); 
    }
}
function drawRubberbandShape(loc) {
    /*  画直线
    */

    // 画圆形
    drawCircle(loc);
}
function updateRubberband(loc) {
    updateRubberbandRectangle(loc);
    drawRubberbandShape(loc);
}
// Guidewires.........................................................
function drawHorizontalLine (y) {
    context.beginPath();
    context.moveTo(0,y+0.5);
    context.lineTo(context.canvas.width, y+0.5);
    context.stroke();
}
function drawVerticalLine (x) {
    context.beginPath();
    context.moveTo(x+0.5,0);
    context.lineTo(x+0.5, context.canvas.height);
    context.stroke();
}
function drawGuidewires(x, y) {
    context.save();
    context.strokeStyle = 'rgba(0,0,230,0.4)';
    context.lineWidth = 0.5;
    drawVerticalLine(x);
    drawHorizontalLine(y);
    context.restore();
}
// Canvas event handlers..............................................
canvas.onmousedown = function (e) {
    let loc = windowToCanvas(e.clientX, e.clientY);
    e.preventDefault(); // Prevent cursor change
    saveDrawingSurface();
    mousedown.x = loc.x;
    mousedown.y = loc.y;
    dragging = true;
};
canvas.onmousemove = function (e) {
    let loc;
    if (dragging) {
        e.preventDefault(); // Prevent selections
        loc = windowToCanvas(e.clientX, e.clientY);
        restoreDrawingSurface();
        updateRubberband(loc);
        if(guidewires) {
            drawGuidewires(loc.x, loc.y);
        }
    }
};
canvas.onmouseup = function (e) {
    loc = windowToCanvas(e.clientX, e.clientY);
    restoreDrawingSurface();
    updateRubberband(loc);
    dragging = false;
};
// Controls event handlers.......................................
eraseAllButton.onclick = function (e) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid('lightgray', 10, 10); 
    saveDrawingSurface();
};
strokeStyleSelect.onchange = function (e) {
    context.fillStyle = context.strokeStyle = strokeStyleSelect.value;
};
guidewireCheckbox.onchange = function (e) {
    guidewires = guidewireCheckbox.checked;
};
// Initialization................................................
context.strokeStyle = strokeStyleSelect.value;
drawGrid('lightgray', 10, 10);

