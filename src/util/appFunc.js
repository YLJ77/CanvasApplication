export function drawPoint({ x, y, radius = 5, ctx, color = 'red' }) {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.restore();
}
export function drawBatchPoint({ points, ctx }) {
    points.forEach((x, index) => {
        if ((index < points.length - 1) && (index + 1) % 2 !== 0) {
            let y = points[index + 1];
            drawPoint({ x, y, ctx });
        }
    });
}
export function restoreDrawingSurface({ ctx, imgData }) {
    ctx.putImageData(imgData, 0, 0);
}

export function saveDrawingSurface({ ctx, canvas }) {
    return ctx.getImageData(0, 0,
        canvas.width,
        canvas.height);
}

export function windowToCanvas({x, y, canvas}) {
    var bbox = canvas.getBoundingClientRect();
    return { x: x - bbox.left * (canvas.width / bbox.width),
        y: y - bbox.top * (canvas.height / bbox.height) };
}

function drawHorizontalLine ({ y, ctx }) {
    ctx.beginPath();
    ctx.moveTo(0,y+0.5);
    ctx.lineTo(ctx.canvas.width, y+0.5);
    ctx.stroke();
}
function drawVerticalLine ({ x, ctx }) {
    ctx.beginPath();
    ctx.moveTo(x+0.5,0);
    ctx.lineTo(x+0.5, ctx.canvas.height);
    ctx.stroke();
}
export function drawGuidewires({ x, y, ctx }) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0,0,230,0.4)';
    ctx.lineWidth = 0.5;
    drawVerticalLine({ x, ctx });
    drawHorizontalLine({ y, ctx });
    ctx.restore();
}
export function drawGrid({ ctx, color, stepx, stepy }) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.5;
    for (let i = stepx + 0.5; i < ctx.canvas.width; i += stepx) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, ctx.canvas.height);
        ctx.stroke();
    }
    for (let i = stepy + 0.5; i < ctx.canvas.height; i += stepy) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(ctx.canvas.width, i);
        ctx.stroke();
    }
    ctx.restore();
}

export function drawAxes({ctx, canvas}) {
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
        ctx.beginPath();
        ctx.moveTo(AXIS_ORIGIN.x, AXIS_ORIGIN.y);
        ctx.lineTo(AXIS_RIGHT, AXIS_ORIGIN.y);
        ctx.stroke();
    }
    function drawVerticalAxis() {
        ctx.beginPath();
        ctx.moveTo(AXIS_ORIGIN.x, AXIS_ORIGIN.y);
        ctx.lineTo(AXIS_ORIGIN.x, AXIS_TOP);
        ctx.stroke();
    }
    function drawVerticalAxisTicks() {
        var deltaX;
        for (var i=1; i < NUM_VERTICAL_TICKS; ++i) {
            ctx.beginPath();
            if (i % 5 === 0) deltaX = TICK_WIDTH;
            else deltaX = TICK_WIDTH/2;
            ctx.moveTo(AXIS_ORIGIN.x - deltaX,
                AXIS_ORIGIN.y - i * VERTICAL_TICK_SPACING);
            ctx.lineTo(AXIS_ORIGIN.x + deltaX,
                AXIS_ORIGIN.y - i * VERTICAL_TICK_SPACING);
            ctx.stroke();
        }
    }
    function drawHorizontalAxisTicks() {
        var deltaY;
        for (var i=1; i < NUM_HORIZONTAL_TICKS; ++i) {
            ctx.beginPath();
            if (i % 5 === 0) deltaY = TICK_WIDTH;
            else deltaY = TICK_WIDTH/2;
            ctx.moveTo(AXIS_ORIGIN.x + i * HORIZONTAL_TICK_SPACING,
                AXIS_ORIGIN.y - deltaY);
            ctx.lineTo(AXIS_ORIGIN.x + i * HORIZONTAL_TICK_SPACING,
                AXIS_ORIGIN.y + deltaY);
            ctx.stroke();
        }
    }
    ctx.save();
    ctx.strokeStyle = AXIS_COLOR;
    ctx.lineWidth = AXIS_LINEWIDTH;
    drawHorizontalAxis();
    drawVerticalAxis();
    ctx.lineWidth = 0.5;
    ctx.lineWidth = TICKS_LINEWIDTH;
    ctx.strokeStyle = TICKS_COLOR;
    drawVerticalAxisTicks();
    drawHorizontalAxisTicks();
    ctx.restore();
}
