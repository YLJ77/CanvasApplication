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
        this.type = new.target.name;
        this.offsets = null;
    }
    cacheOffset(loc) {
        let { x, y } = this;
        this.offsets = [];
        let offsetX = loc.x -x;
        let offsetY = loc.y - y;
        this.offsets.push({ offsetX, offsetY });
    }
    updatePoints(loc) {
        this.offsets.forEach(offset => {
            this.x = loc.x - offset.offsetX;
            this.y = loc.y - offset.offsetY;
        })
    }
    createPath() {}
    draw() {
        let { context, filled } = this;
        context.save();
        this.createPath(context);
        context.strokeStyle = this.strokeStyle;
        context.stroke();
        if (filled) {
            context.fillStyle = this.fillStyle;
            context.fill();
        }
        context.restore();
    }
    move(x, y) {
        this.x = x;
        this.y = y;
    }
}
export class BezierCurve extends Shape {
    constructor({ context, pointRadius = 5, fillStyle, strokeStyle, endPoints, controlPoints }) {
        super({ context, strokeStyle, fillStyle, filled: false });
        this.endPoints = JSON.parse(JSON.stringify(endPoints));
        this.controlPoints = JSON.parse(JSON.stringify(controlPoints));
        this.draggingPoint = null;
        this.pointRadius = pointRadius;
    }
    stroke({ filled = false } = {}) {
        let { context, strokeStyle, fillStyle } = this;
        context.save();
        context.strokeStyle = strokeStyle;
        context.stroke();
        if (filled) {
            context.fillStyle = fillStyle;
            context.fill();
        }
        context.restore();
    }
    createPointPath({ isDraw = false } = {}) {
        let { endPoints, controlPoints, context, pointRadius } = this;
        !isDraw && context.beginPath();
        endPoints.concat(controlPoints)
            .forEach(point => {
                let { x, y } = point;
                if (isDraw) {
                    context.beginPath();
                    context.arc(x, y, pointRadius, 0, 2 * Math.PI, false);
                    context.closePath();
                    this.stroke({ filled: true });
                } else {
                    context.arc(x, y, pointRadius, 0, 2 * Math.PI, false);
                }
            });
        !isDraw && context.closePath();
    }
    drawCurve() {
        let { endPoints, controlPoints, context } = this;
        context.moveTo(endPoints[0].x, endPoints[0].y);
        context.bezierCurveTo(controlPoints[0].x, controlPoints[0].y,
            controlPoints[1].x, controlPoints[1].y,
            endPoints[1].x, endPoints[1].y);
        this.stroke();
    }
    cacheOffset(loc) {
        let { endPoints, controlPoints } = this;
        this.offsets = [];
        endPoints.concat(controlPoints).forEach(point => {
            let offsetX = loc.x -point.x;
            let offsetY = loc.y - point.y;
            this.offsets.push({ offsetX, offsetY });
        });
    }
    updatePoints(loc) {
        let { endPoints, controlPoints, offsets } = this;
        endPoints.concat(controlPoints).forEach((point, index) => {
            point.x = loc.x - offsets[index].offsetX;
            point.y = loc.y - offsets[index].offsetY;
        });
    }
    createRectPath() {
        let { x, y, width, height } = this.getRectInfo();
        let { context } = this;
        context.beginPath();
        context.rect(x, y, width, height);
        context.closePath();
    }
    getRectInfo() {
        let minX, minY, maxX, maxY;
        let { endPoints, controlPoints } = this;
        minX = minY = 100000;
        maxX = maxY = 0;
        endPoints.concat(controlPoints).forEach( point => {
            let { x, y } = point;
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        });
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        }
    }
    createEditPath() {
        this.createPointPath();
    }
    createPath() {
        this.createRectPath();
    }
    draw() {
        this.createPointPath({ isDraw: true });
        this.drawCurve();
    }
    getDraggingPoint(loc) {
        let { endPoints, controlPoints, context } = this;
        let radius = 5;
        let points = controlPoints.concat(endPoints);
        for (let point of points) {
            context.beginPath();
            context.arc(point.x, point.y,
                radius, 0, Math.PI * 2, false);
            context.closePath();
            if (context.isPointInPath(loc.x, loc.y)) {
                this.draggingPoint = point;
                break;
            }
        }
    }
    updateDraggingPoint(loc) {
        let { draggingPoint } = this;
        draggingPoint.x = loc.x;
        draggingPoint.y = loc.y;
    }
}
export class Line extends Shape {
    constructor({ context, filled, strokeStyle, beginX, beginY, endX, endY }) {
        super({ context, strokeStyle, filled })
        this.x = beginX;
        this.y = beginY;
        this.endX = endX;
        this.endY = endY;
    }
    createPath() {
        let { x, y, endX, endY, context } = this;
        context.beginPath();
        context.rect(Math.min(x, endX), Math.min(y, endY), Math.abs(x - endX), Math.abs(y - endY));
        context.closePath();
    }
    cacheOffset(loc) {
        let { x, y, endX, endY } = this;
        this.offsets = [];
        this.offsets.push({ offsetX: loc.x - x, offsetY: loc.y - y });
        this.offsets.push({ offsetX: loc.x - endX, offsetY: loc.y - endY });
    }
    updatePoints(loc) {
        let { offsets } = this;
        this.x = loc.x - offsets[0].offsetX;
        this.y = loc.y - offsets[0].offsetY;
        this.endX = loc.x - offsets[1].offsetX;
        this.endY = loc.y - offsets[1].offsetY;
    }
    draw() {
        let { x, y, endX, endY, context, strokeStyle } = this;
        context.save();
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(endX, endY);
        context.closePath();
        context.strokeStyle = strokeStyle;
        context.stroke();
        context.restore();

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
export class RoundRect extends Shape {
    constructor({ context, width, height, cornerRadius = 10, cornerX, cornerY, fillStyle, strokeStyle, filled }) {
        super({ fillStyle, filled, strokeStyle, context });
        this.x = cornerX;
        this.y = cornerY;
        this.cornerRadius = cornerRadius;
        this.width = width;
        this.height = height;
    }
    createPath() {
        let { context, width, height, cornerRadius, x: cornerX, y: cornerY } = this;
        context.beginPath();
        context.moveTo(cornerX + cornerRadius, cornerY);
        context.arcTo(cornerX + width, cornerY, cornerX + width, cornerY + height, cornerRadius);
        context.arcTo(cornerX + width, cornerY + height, cornerX, cornerY + height, cornerRadius);
        context.arcTo(cornerX, cornerY + height, cornerX, cornerY, cornerRadius);
        context.arcTo(cornerX, cornerY, cornerX + cornerRadius, cornerY, cornerRadius);
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
