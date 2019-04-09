import { drawPoint } from "./appFunc";

export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class Shape {
    constructor({ ctx, strokeStyle, fillStyle, filled, startRadians }) {
        this.ctx = ctx;
        this.strokeStyle = strokeStyle;
        this.fillStyle = fillStyle;
        this.filled = filled;
        this.type = new.target.name;
        this.offsets = null;
        this.startRadians = startRadians || 0;
    }
    savePointOffset(loc) {
        let { x, y } = this;
        this.offsets = [];
        let offsetX = loc.x -x;
        let offsetY = loc.y - y;
        this.offsets.push({ offsetX, offsetY });
    }
    updatePointsOnMoving(loc) {
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
        let { ctx, filled, _debugger, drawDebuggerPoint } = this;
        ctx.save();
        this.createPath(ctx);
        ctx.strokeStyle = this.strokeStyle;
        ctx.stroke();
        if (filled) {
            ctx.fillStyle = this.fillStyle;
            ctx.fill();
        }
        ctx.restore();
        if (drawDebuggerPoint && _debugger) {
            this.drawDebuggerPoint();
        }
    }
    setShapeTransform({ radians, tx, ty }) {
        let { ctx } = this;
        /*        ctx.translate(tx, ty);
                ctx.rotate(radians);*/
        let sin = Math.sin(radians),
            cos = Math.cos(radians);
        let currentTransform = {
            a: cos,  c: -sin, e: tx,
            b: sin, d: cos, f: ty
        };
        let { a, b, c, d, e, f } = currentTransform;
        ctx.transform(a,b,c,d,e,f);
        ctx.currentTransform = currentTransform;
    }
    rotate(radians = 0) {
        let { ctx, x, y } = this;

        ctx.save();
        this.startRadians = radians;
        this.setShapeTransform({ radians, tx: x, ty: y });
        this.x = 0;
        this.y = 0;

        this.draw();
        ctx.restore();

        this.x = x;
        this.y = y;
    }
    getTransformPointToScreenPoint({ x, y, tx, ty }) {
        let { ctx } = this;
        let { currentTransform: { a, b, c, d, e, f } } = ctx;
        if (tx !== undefined) e = tx;
        if (ty !== undefined) f = ty;
        return {
            x: x * a + y * c + e,
            y: x * b + y * d + f
        };
    }
    updatePointAfterRotated() {}
}
export class BezierCurve extends Shape {
    constructor({ ctx, pointRadius = 5, startRadians, fillStyle, strokeStyle, endPoints, controlPoints }) {
        super({ ctx, strokeStyle, fillStyle, startRadians, filled: false });
        this.endPoints = endPoints;
        this.controlPoints = controlPoints;
        this.draggingPoint = null;
        this.pointRadius = pointRadius;
        this.isEditing = false;
        this.setCenter();
    }
    setCenter() {
        let { width, height, x: minX, y: minY } = this.getRectInfo();
        this.radius = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
        this.x = width / 2 + minX;
        this.y = height / 2 + minY;
    }
    rotate(radians = 0) {
        let { ctx, x, y, endPoints, controlPoints } = this;
        let tEndPonts = JSON.parse(JSON.stringify(endPoints));
        let tControlPoints = JSON.parse(JSON.stringify(controlPoints));
        ctx.save();
        this.startRadians = radians;
        this.setShapeTransform({ radians, tx: x, ty: y });
        this.x = 0;
        this.y = 0;
        endPoints.concat(controlPoints).forEach(point => {
           point.x -= x;
           point.y -= y;
        });
        this.draw();
        ctx.restore();

        this.x = x;
        this.y = y;
        this.endPoints = tEndPonts;
        this.controlPoints = tControlPoints;
    }
    updatePointAfterRotated() {
        let { endPoints, controlPoints, x: centerX, y: centerY } = this;
        endPoints.concat(controlPoints).forEach(point => {
            let { x, y } = point;
            x -= centerX;
            y -= centerY;
            let tPoint = this.getTransformPointToScreenPoint({ x, y });
            point.x = tPoint.x;
            point.y = tPoint.y;
        });
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
    updatePointsOnMoving(loc) {
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
        this.isEditing && this.createPointPath({ isDraw: true });
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
    updatePointOnEditing(loc) {
        let { draggingPoint } = this;
        draggingPoint.x = loc.x;
        draggingPoint.y = loc.y;
    }
}
export class Line extends Shape {
    constructor({ ctx, filled, strokeStyle, beginX, beginY, endX, endY, startRadians }) {
        super({ ctx, strokeStyle, filled, startRadians });
        this.x = beginX;
        this.y = beginY;
        this.endX = endX;
        this.endY = endY;
        this.radius = Math.sqrt(Math.pow(Math.abs(beginX - endX), 2) + Math.pow(Math.abs(beginY-endY), 2));
    }
    updatePointAfterRotated() {
        let { endX, endY, x, y } = this;
        endX -= x;
        endY -= y;
        let point = this.getTransformPointToScreenPoint({ x: endX, y: endY });
        this.endX = point.x;
        this.endY = point.y;
    }
    rotate(radians = 0) {
        let { ctx, endX, endY, x, y } = this;
        ctx.save();

        this.setShapeTransform({ radians, tx: x, ty: y });

        this.x = 0;
        this.y = 0;
        this.endX -= x;
        this.endY -= y;

        this.draw();
        ctx.restore();

        this.x = x;
        this.y = y;
        this.endX = endX;
        this.endY = endY;
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
    updatePointsOnMoving(loc) {
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
    constructor({ ctx, width, height, startRadians, cornerRadius = 10, cornerX, cornerY, fillStyle, strokeStyle, filled }) {
        super({ fillStyle, filled, strokeStyle, startRadians, ctx });
        this.x = width / 2 + cornerX;   // rotate center x | protractor center
        this.y = height / 2 + cornerY;  // rotate center y
        this.cornerX = cornerX;
        this.cornerY = cornerY;
        this.cornerRadius = cornerRadius;
        this.width = width;
        this.height = height;
        this.radius = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
        this.isRotated = false;
        this._debugger = false;
        this.setControlPoint();
    }
    setControlPoint() {
        let { cornerX, cornerY, cornerRadius, width, height } = this;
        let basePointX = cornerX + cornerRadius;
        let controlPointX = cornerX + width;
        let controlPointY = cornerY + height;
        this.controlPoint = [
            {
                x: basePointX,
                y: cornerY
            },
            {
                cx1: controlPointX,
                cy1: cornerY,
                cx2: controlPointX,
                cy2: controlPointY,
                radius: cornerRadius
            },
            {
                cx1: controlPointX,
                cy1: controlPointY,
                cx2: cornerX,
                cy2: controlPointY,
                radius: cornerRadius
            },
            {
                cx1: cornerX,
                cy1: controlPointY,
                cx2: cornerX,
                cy2: cornerY,
                radius: cornerRadius
            },
            {
                cx1: cornerX,
                cy1: cornerY,
                cx2: basePointX,
                cy2: cornerY,
                radius: cornerRadius
            },
        ];
    }
    rotate(radians = 0) {
        let { ctx, width, height, cornerX, cornerY, x, y } = this;
        let tCornerX = -width / 2,
            tCornerY = -height / 2;
        this.isRotated = true;
        this.startRadians = radians;
        ctx.save();

        this.setShapeTransform({ radians, tx: x, ty: y });

        this.x = 0;
        this.y = 0;
        this.cornerX = tCornerX;
        this.cornerY = tCornerY;
        this.setControlPoint();

        this.draw();
        ctx.restore();

        this.x = x;
        this.y = y;
        this.cornerX = cornerX;
        this.cornerY = cornerY;
    }
    updatePointAfterRotated({ tx, ty } = {}) {
        let { cornerRadius, width, height, controlPoint } = this;
        let tCornerX = -width / 2,
            tCornerY = -height / 2;
        let tBasePointX = tCornerX + cornerRadius;
        let tControlPointX = tCornerX + width;
        let tControlPointY = tCornerY + height;
        let tPoints = [];
        controlPoint.forEach((entry, index) => {
            let basePoint, controlPoint1, controlPoint2;
            switch (index) {
                case 0:
                    basePoint = this.getTransformPointToScreenPoint({ x: tBasePointX, y: tCornerY, tx, ty });
                    break;
                case 1:
                    controlPoint1 = this.getTransformPointToScreenPoint({ x: tControlPointX, y: tCornerY, tx, ty });
                    controlPoint2 = this.getTransformPointToScreenPoint({ x: tControlPointX, y: tControlPointY, tx, ty });
                    break;
                case 2:
                    controlPoint1 = this.getTransformPointToScreenPoint({ x: tControlPointX, y: tControlPointY, tx, ty });
                    controlPoint2 = this.getTransformPointToScreenPoint({ x: tCornerX, y: tControlPointY, tx, ty });
                    break;
                case 3:
                    controlPoint1 = this.getTransformPointToScreenPoint({ x: tCornerX, y: tControlPointY, tx, ty });
                    controlPoint2 = this.getTransformPointToScreenPoint({ x: tCornerX, y: tCornerY, tx, ty });
                    break;
                case 4:
                    controlPoint1 = this.getTransformPointToScreenPoint({ x: tCornerX, y: tCornerY, tx, ty });
                    controlPoint2 = this.getTransformPointToScreenPoint({ x: tBasePointX, y: tCornerY, tx, ty });
                    break;
            }
            if (index === 0) {
                tPoints.push({ x: basePoint.x, y: basePoint.y });
            } else {
                tPoints.push({
                    cx1: controlPoint1.x,
                    cy1: controlPoint1.y,
                    cx2: controlPoint2.x,
                    cy2: controlPoint2.y,
                    radius: cornerRadius
                });
            }
            this.controlPoint = tPoints;
        });
    }
    savePointOffset(loc) {
        let { cornerX, cornerY } = this;
        let offsetX = loc.x -cornerX;
        let offsetY = loc.y - cornerY;
        this.offsets = [{ offsetX, offsetY }];
    }
    updatePointsOnMoving(loc) {
        this.offsets.forEach(offset => {
            this.cornerX = loc.x - offset.offsetX;
            this.cornerY = loc.y - offset.offsetY;
        });
        let { width, height, cornerX, cornerY, isRotated } = this;
        this.x = width / 2 + cornerX;   // rotate center x | protractor center
        this.y = height / 2 + cornerY;  // rotate center y
        if (isRotated) {
            this.updatePointAfterRotated({ tx: this.x, ty: this.y });
        } else {
            this.setControlPoint({ cornerX, cornerY });
        }
    }
    createPath() {
        let { ctx, controlPoint } = this;
        let [ basePoint, ...cPoint ] = controlPoint;
        ctx.beginPath();
        ctx.moveTo(basePoint.x, basePoint.y);
        cPoint.forEach(point => {
            let { cx1, cy1, cx2, cy2, radius } = point;
            ctx.arcTo(cx1, cy1, cx2, cy2, radius);
        });
        ctx.closePath();
    }
    drawDebuggerPoint() {
        let { ctx, controlPoint } = this;
        let [ basePoint, ...cPoint ] = controlPoint;
        let radius = 4;
        drawPoint({ x: basePoint.x, y: basePoint.y, ctx, radius });
        cPoint.forEach(point => {
            let { cx1, cy1, cx2, cy2 } = point;
            drawPoint({ x: cx1, y: cy1, ctx, color: 'green', radius });
            drawPoint({ x: cx2, y: cy2, ctx, color: 'yellow', radius });
        });
    }

}
export class Polygon extends Shape {
    constructor({ centerX, centerY, radius,
                    sides, startRadians, strokeStyle, fillStyle, filled, ctx }) {
        super({ ctx, filled, fillStyle, strokeStyle, startRadians });
        this.x = centerX;
        this.y = centerY;
        this.radius = radius;
        this.sides = sides;
    }
    getPoints() {
        let points = [],
            radians = this.startRadians || 0;
        for (let i=0; i < this.sides; ++i) {
            points.push(new Point(this.x + this.radius * Math.sin(radians),
                this.y - this.radius * Math.cos(radians)));
            radians += 2*Math.PI/this.sides;
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
