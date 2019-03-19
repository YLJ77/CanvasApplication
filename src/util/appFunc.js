function drawPoint({ x, y, radius = 5, context }) {
    context.save();
    context.beginPath();
    context.fillStyle = 'red';
    context.arc(x, y, radius, 0, 2 * Math.PI, false);
    context.fill();
    context.restore();
}
export function drawBatchPoint({ points, context }) {
    points.forEach((x, index) => {
        if ((index < points.length - 1) && (index + 1) % 2 !== 0) {
            let y = points[index + 1];
            drawPoint({ x, y, context });
        }
    });
}
export function restoreDrawingSurface({ context, imgData }) {
    context.putImageData(imgData, 0, 0);
}

export function saveDrawingSurface({ context, canvas }) {
    return context.getImageData(0, 0,
        canvas.width,
        canvas.height);
}

export function windowToCanvas({x, y, canvas}) {
    var bbox = canvas.getBoundingClientRect();
    return { x: x - bbox.left * (canvas.width / bbox.width),
        y: y - bbox.top * (canvas.height / bbox.height) };
}

function drawHorizontalLine ({ y, context }) {
    context.beginPath();
    context.moveTo(0,y+0.5);
    context.lineTo(context.canvas.width, y+0.5);
    context.stroke();
}
function drawVerticalLine ({ x, context }) {
    context.beginPath();
    context.moveTo(x+0.5,0);
    context.lineTo(x+0.5, context.canvas.height);
    context.stroke();
}
export function drawGuidewires({ x, y, context }) {
    context.save();
    context.strokeStyle = 'rgba(0,0,230,0.4)';
    context.lineWidth = 0.5;
    drawVerticalLine({ x, context });
    drawHorizontalLine({ y, context });
    context.restore();
}
export function drawGrid({ context, color, stepx, stepy }) {
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

export function drawAxes({context}) {
    var AXIS_MARGIN = 40,
        AXIS_ORIGIN = { x: AXIS_MARGIN, y: canvas.height-AXIS_MARGIN },
        AXIS_TOP = AXIS_MARGIN,
        AXIS_RIGHT = canvas.width-AXIS_MARGIN,
        HORIZONTAL_TICK_SPACING = 10,
        VERTICAL_TICK_SPACING = 10,
        AXIS_WIDTH = AXIS_RIGHT - AXIS_ORIGIN.x,
        AXIS_HEIGHT = AXIS_ORIGIN.y - AXIS_TOP,
        NUM_VERTICAL_TICKS = AXIS_HEIGHT / VERTICAL_TICK_SPACING,
        NUM_HORIZONTAL_TICKS = AXIS_WIDTH / HORIZONTAL_TICK_SPACING,
        TICK_WIDTH = 10,
        TICKS_LINEWIDTH = 0.5,
        TICKS_COLOR = 'navy',
        AXIS_LINEWIDTH = 1.0,
        AXIS_COLOR = 'blue';

    function drawHorizontalAxis() {
        context.beginPath();
        context.moveTo(AXIS_ORIGIN.x, AXIS_ORIGIN.y);
        context.lineTo(AXIS_RIGHT, AXIS_ORIGIN.y);
        context.stroke();
    }
    function drawVerticalAxis() {
        context.beginPath();
        context.moveTo(AXIS_ORIGIN.x, AXIS_ORIGIN.y);
        context.lineTo(AXIS_ORIGIN.x, AXIS_TOP);
        context.stroke();
    }
    function drawVerticalAxisTicks() {
        var deltaX;
        for (var i=1; i < NUM_VERTICAL_TICKS; ++i) {
            context.beginPath();
            if (i % 5 === 0) deltaX = TICK_WIDTH;
            else deltaX = TICK_WIDTH/2;
            context.moveTo(AXIS_ORIGIN.x - deltaX,
                AXIS_ORIGIN.y - i * VERTICAL_TICK_SPACING);
            context.lineTo(AXIS_ORIGIN.x + deltaX,
                AXIS_ORIGIN.y - i * VERTICAL_TICK_SPACING);
            context.stroke();
        }
    }
    function drawHorizontalAxisTicks() {
        var deltaY;
        for (var i=1; i < NUM_HORIZONTAL_TICKS; ++i) {
            context.beginPath();
            if (i % 5 === 0) deltaY = TICK_WIDTH;
            else deltaY = TICK_WIDTH/2;
            context.moveTo(AXIS_ORIGIN.x + i * HORIZONTAL_TICK_SPACING,
                AXIS_ORIGIN.y - deltaY);
            context.lineTo(AXIS_ORIGIN.x + i * HORIZONTAL_TICK_SPACING,
                AXIS_ORIGIN.y + deltaY);
            context.stroke();
        }
    }
    context.save();
    context.strokeStyle = AXIS_COLOR;
    context.lineWidth = AXIS_LINEWIDTH;
    drawHorizontalAxis();
    drawVerticalAxis();
    context.lineWidth = 0.5;
    context.lineWidth = TICKS_LINEWIDTH;
    context.strokeStyle = TICKS_COLOR;
    drawVerticalAxisTicks();
    drawHorizontalAxisTicks();
    context.restore();
}
