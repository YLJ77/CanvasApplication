export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class Shape {
    constructor({ context, strokeStyle, fillStyle, filled }) {
        this.context = context;
        this.strokeStyle = strokeStyle;
        this.fillStyle = fillStyle;
        this.filled = filled;
    }
    createPath() {}
    stroke() {
        let { context } = this;
        context.save();
        this.createPath(context);
        context.strokeStyle = this.strokeStyle;
        context.stroke();
        context.restore();
    }
    fill() {
        let { context } = this;
        context.save();
        this.createPath(context);
        context.fillStyle = this.fillStyle;
        context.fill();
        context.restore();
    }
    move(x, y) {
        this.x = x;
        this.y = y;
    }
}
export class Circle extends Shape{
    constructor({ centerX, centerY, radius, context, filled, strokeStyle, fillStyle }) {
        super({ context, strokeStyle, fillStyle, filled });
        this.x = centerX;
        this.y = centerY;
        this.radius = radius;
    }
    createPath() {
        let { context, x, y, radius } = this;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI*2, false);
        context.closePath();
    }
}
export class Polygon extends Shape {
    constructor({ centerX, centerY, radius,
                    sides, startAngle, strokeStyle, fillStyle, filled, context }) {
        super({ context, filled, fillStyle, strokeStyle });
        this.x = centerX;
        this.y = centerY;
        this.radius = radius;
        this.sides = sides;
        this.startAngle = startAngle;
    }
    getPoints() {
        let points = [],
            angle = this.startAngle || 0;
        for (var i=0; i < this.sides; ++i) {
            points.push(new Point(this.x + this.radius * Math.sin(angle),
                this.y - this.radius * Math.cos(angle)));
            angle += 2*Math.PI/this.sides;
        }
        return points;
    }
    createPath() {
        let points = this.getPoints();
        let { context } = this;
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        for (var i=1; i < this.sides; ++i) {
            context.lineTo(points[i].x, points[i].y);
        }
        context.closePath();
    }
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
