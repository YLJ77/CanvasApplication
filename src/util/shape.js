export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class Shape {
    constructor({ ctx, strokeStyle, fillStyle, filled }) {
        this.ctx = ctx;
        this.strokeStyle = strokeStyle;
        this.fillStyle = fillStyle;
        this.filled = filled;
        this.type = new.target.name;
        this.offsets = null;
    }
    savePointOffset(loc) {
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
    createEditPath() {
        this.createPath();
    }
    draw() {
        let { ctx, filled } = this;
        ctx.save();
        this.createPath(ctx);
        ctx.strokeStyle = this.strokeStyle;
        ctx.stroke();
        if (filled) {
            ctx.fillStyle = this.fillStyle;
            ctx.fill();
        }
        ctx.restore();
    }
    rotate(angle) {
        let { ctx } = this;
        let tx = this.x,
            ty = this.y;

        ctx.save();

        ctx.translate(tx, ty);

        if (angle) {
            ctx.rotate(angle);
        }

        this.x = 0;
        this.y = 0;

        this.draw();
        ctx.restore();

        this.x = tx;
        this.y = ty;
    }
    move(x, y) {
        this.x = x;
        this.y = y;
    }
}
export class BezierCurve extends Shape {
    constructor({ ctx, pointRadius = 5, fillStyle, strokeStyle, endPoints, controlPoints }) {
        super({ ctx, strokeStyle, fillStyle, filled: false });
        this.endPoints = JSON.parse(JSON.stringify(endPoints));
        this.controlPoints = JSON.parse(JSON.stringify(controlPoints));
        this.draggingPoint = null;
        this.pointRadius = pointRadius;
        let { width, height, x: minX, y: minY } = this.getRectInfo();
        this.radius = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
        this.x = width / 2 + minX;
        this.y = height / 2 + minY;
    }
    stroke({ filled = false } = {}) {
        let { ctx, strokeStyle, fillStyle } = this;
        ctx.save();
        ctx.strokeStyle = strokeStyle;
        ctx.stroke();
        if (filled) {
            ctx.fillStyle = fillStyle;
            ctx.fill();
        }
        ctx.restore();
    }
    createPointPath({ isDraw = false } = {}) {
        let { endPoints, controlPoints, ctx, pointRadius } = this;
        !isDraw && ctx.beginPath();
        endPoints.concat(controlPoints)
            .forEach(point => {
                let { x, y } = point;
                if (isDraw) {
                    ctx.beginPath();
                    ctx.arc(x, y, pointRadius, 0, 2 * Math.PI, false);
                    ctx.closePath();
                    this.stroke({ filled: true });
                } else {
                    ctx.arc(x, y, pointRadius, 0, 2 * Math.PI, false);
                }
            });
        !isDraw && ctx.closePath();
    }
    drawCurve() {
        let { endPoints, controlPoints, ctx } = this;
        ctx.beginPath();
        ctx.moveTo(endPoints[0].x, endPoints[0].y);
        ctx.bezierCurveTo(controlPoints[0].x, controlPoints[0].y,
            controlPoints[1].x, controlPoints[1].y,
            endPoints[1].x, endPoints[1].y);
        this.stroke();
        ctx.closePath();
    }
    savePointOffset(loc) {
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
        let { ctx } = this;
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.closePath();
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
        let { endPoints, controlPoints, ctx } = this;
        let radius = 5;
        let points = controlPoints.concat(endPoints);
        for (let point of points) {
            ctx.beginPath();
            ctx.arc(point.x, point.y,
                radius, 0, Math.PI * 2, false);
            ctx.closePath();
            if (ctx.isPointInPath(loc.x, loc.y)) {
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
    constructor({ ctx, filled, strokeStyle, beginX, beginY, endX, endY }) {
        super({ ctx, strokeStyle, filled });
        this.x = beginX;
        this.y = beginY;
        this.endX = endX;
        this.endY = endY;
        this.radius = Math.sqrt(Math.pow(Math.abs(beginX - endX), 2) + Math.pow(Math.abs(beginY-endY), 2));
    }
    rotate(angle) {
        let { ctx, endX, endY, x, y } = this;
        let tx = this.x,
            ty = this.y;

        ctx.save();

        ctx.translate(tx, ty);

        if (angle) {
            ctx.rotate(angle);
        }

        this.x = 0;
        this.y = 0;
        this.endX = endX - x;
        this.endY = endY - y;

        this.draw();
        ctx.restore();

        this.x = tx;
        this.y = ty;
    }
    createPath() {
        let { x, y, endX, endY, ctx } = this;
        ctx.beginPath();
        ctx.rect(Math.min(x, endX), Math.min(y, endY), Math.abs(x - endX), Math.abs(y - endY));
        ctx.closePath();
    }
    savePointOffset(loc) {
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
        let { x, y, endX, endY, ctx, strokeStyle } = this;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.closePath();
        ctx.strokeStyle = strokeStyle;
        ctx.stroke();
        ctx.restore();

    }
}
export class Circle extends Shape{
    constructor({ centerX, centerY, radius, ctx, filled, strokeStyle, fillStyle }) {
        super({ ctx, strokeStyle, fillStyle, filled });
        this.x = centerX;
        this.y = centerY;
        this.radius = radius;
    }
    createPath() {
        let { ctx, x, y, radius } = this;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI*2, false);
        ctx.closePath();
    }
}
export class RoundRect extends Shape {
    constructor({ ctx, width, height, cornerRadius = 10, cornerX, cornerY, fillStyle, strokeStyle, filled }) {
        super({ fillStyle, filled, strokeStyle, ctx });
        this.cornerX = cornerX;
        this.cornerY = cornerY;
        this.x = width / 2 + cornerX;
        this.y = height / 2 + cornerY;
        this.cornerRadius = cornerRadius;
        this.width = width;
        this.height = height;
        this.radius = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
    }
    savePointOffset(loc) {
        let { cornerX, cornerY } = this;
        this.offsets = [];
        let offsetX = loc.x -cornerX;
        let offsetY = loc.y - cornerY;
        this.offsets.push({ offsetX, offsetY });
    }
    updatePoints(loc) {
        this.offsets.forEach(offset => {
            this.cornerX = loc.x - offset.offsetX;
            this.cornerY = loc.y - offset.offsetY;
        })
    }
    createPath() {
        let { ctx, width, height, cornerRadius, cornerX, cornerY } = this;
        ctx.beginPath();
        ctx.moveTo(cornerX + cornerRadius, cornerY);
        ctx.arcTo(cornerX + width, cornerY, cornerX + width, cornerY + height, cornerRadius);
        ctx.arcTo(cornerX + width, cornerY + height, cornerX, cornerY + height, cornerRadius);
        ctx.arcTo(cornerX, cornerY + height, cornerX, cornerY, cornerRadius);
        ctx.arcTo(cornerX, cornerY, cornerX + cornerRadius, cornerY, cornerRadius);
        ctx.closePath();
    }

}
export class Polygon extends Shape {
    constructor({ centerX, centerY, radius,
                    sides, startAngle, strokeStyle, fillStyle, filled, ctx }) {
        super({ ctx, filled, fillStyle, strokeStyle });
        this.x = centerX;
        this.y = centerY;
        this.radius = radius;
        this.sides = sides;
        this.startAngle = startAngle;
    }
    getPoints() {
        let points = [],
            angle = this.startAngle || 0;
        for (let i=0; i < this.sides; ++i) {
            points.push(new Point(this.x + this.radius * Math.sin(angle),
                this.y - this.radius * Math.cos(angle)));
            angle += 2*Math.PI/this.sides;
        }
        return points;
    }
    createPath() {
        let points = this.getPoints();
        let { ctx } = this;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i=1; i < this.sides; ++i) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
    }
}
