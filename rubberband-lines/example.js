let canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d'),
    eraseAllButton = document.getElementById('eraseAllButton'),
    strokeStyleSelect = document.getElementById('strokeStyleSelect'),
    guidewireCheckbox = document.getElementById('guidewireCheckbox'),
    fillCheckbox = document.getElementById('fillCheckbox'),
    // 多边形 start
    sidesSelect = document.getElementById('sidesNumber'),
    startAngleSelect = document.getElementById('startAngle'),
    Point = function (x, y) {
        this.x = x;
        this.y = y;
    },
    // 多边形 end
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
    // 画圆
    // drawCircle(loc);
    // 画多边形
    drawPolygon(loc);
}
function updateRubberband(loc) {
    updateRubberbandRectangle(loc);
    drawRubberbandShape(loc);
}
// Polygon.........................................................
function getPolygonPoints(centerX, centerY, radius, sides, startAngle) {
    var points = [],
        angle = startAngle || 0;
    for (var i=0; i < sides; ++i) {
        /*
        points.push(new Point(centerX + radius * Math.sin(angle),
            centerY - radius * Math.cos(angle)));
            */

        points.push(
            new Point(
                centerX + radius * Math.cos(angle),
                centerY - radius * Math.sin(angle)
            )
        );

        angle += 2*Math.PI/sides;
    }
    return points;
}
function createPolygonPath(centerX, centerY, radius, sides, startAngle) {
    var points = getPolygonPoints(
        centerX,
        centerY,
        radius,
        sides,
        startAngle 
    );
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (var i=1; i < sides; ++i) {
        context.lineTo(points[i].x, points[i].y);
    }
    context.closePath();
}
function drawPolygon(loc) {
        let {height, width} = rubberbandRect;
        radius = Math.sqrt(height * height + width * width);
    createPolygonPath(
        mousedown.x,
        mousedown.y,
        // rubberbandRect.width,
        radius,
        parseInt(sidesSelect.value),
        (Math.PI / 180) * parseInt(startAngleSelect.value)
    );
    context.stroke();
    if (fillCheckbox.checked) {
        context.fill();
    }
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

