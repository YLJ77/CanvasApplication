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
        this.pointRadius = 5;
        this.isEditing = false;
        this.draggingPoint = null;
        this.points = [];
    }
    getDraggingPoint(loc) {
        let { points, ctx } = this;
        let radius = 5;
        for (let point of points) {
            ctx.beginPath();
            ctx.arc(point.x, point.y,
                radius, 0, Math.PI * 2, false);
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
        this.setCenter();
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
    draw() {
        let { ctx, filled, _debugger, drawDebuggerPoint } = this;
        this.createPath(ctx);
        this.drawPath({ filled });
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
    drawPath({ filled = false } = {}) {
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
    updatePointAfterRotated() {}
    createPath() {}
    createEditPath() {}
    setCenter() {}
}
export class BezierCurve extends Shape {
    constructor({ ctx, startRadians, fillStyle, strokeStyle, endPoints, controlPoints }) {
        super({ ctx, strokeStyle, fillStyle, startRadians, filled: false });
        this.endPoints = endPoints;
        this.controlPoints = controlPoints;
        this.points = [...this.endPoints, ...this.controlPoints];
        this.setCenter();
    }
    setCenter() {
        let { width, height, x: minX, y: minY } = this.getRectInfo();
        this.radius = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
        this.x = width / 2 + minX;
        this.y = height / 2 + minY;
    }
    rotate(radians = 0) {
        let { ctx, x, y, points } = this;
        let tPoint = JSON.parse(JSON.stringify(points));
        ctx.save();
        this.startRadians = radians;
        this.setShapeTransform({ radians, tx: x, ty: y });
        this.x = 0;
        this.y = 0;
        points.forEach(point => {
           point.x -= x;
           point.y -= y;
        });
        this.draw();
        ctx.restore();

        this.x = x;
        this.y = y;
        this.points = tPoint;
    }
    updatePointAfterRotated() {
        let { points, x: centerX, y: centerY } = this;
        points.forEach(point => {
            let { x, y } = point;
            x -= centerX;
            y -= centerY;
            let tPoint = this.getTransformPointToScreenPoint({ x, y });
            point.x = tPoint.x;
            point.y = tPoint.y;
        });
    }
    drawControlPoint() {
        let { points, ctx, pointRadius } = this;
        points.forEach(point => {
                let { x, y } = point;
                ctx.beginPath();
                ctx.arc(x, y, pointRadius, 0, 2 * Math.PI, false);
                this.drawPath({ filled: true });
            });
    }
    createControlPointPath() {
        let { points, ctx, pointRadius } = this;
        ctx.beginPath();
        points.forEach(point => {
                let { x, y } = point;
                ctx.arc(x, y, pointRadius, 0, 2 * Math.PI, false);
            });
    }
    drawCurve() {
        this.createCurvePath();
        this.drawPath();
    }
    createCurvePath() {
        let { points: [ e1, e2, c1, c2 ], ctx } = this;
        ctx.beginPath();
        ctx.moveTo(e1.x, e1.y);
        ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, e2.x, e2.y);
    }
    savePointOffset(loc) {
        let { points } = this;
        this.offsets = [];
        points.forEach(point => {
            let offsetX = loc.x -point.x;
            let offsetY = loc.y - point.y;
            this.offsets.push({ offsetX, offsetY });
        });
    }
    updatePointsOnMoving(loc) {
        let { points, offsets } = this;
        points.forEach((point, index) => {
            point.x = loc.x - offsets[index].offsetX;
            point.y = loc.y - offsets[index].offsetY;
        });
    }
    createRectPath() {
        let { x, y, width, height } = this.getRectInfo();
        let { ctx, pointRadius } = this;
        ctx.beginPath();
        ctx.rect(x - pointRadius, y - pointRadius, width + pointRadius * 2, height + pointRadius * 2);
        ctx.closePath();
    }
    getRectInfo() {
        let minX, minY, maxX, maxY;
        let { points } = this;
        minX = minY = 100000;
        maxX = maxY = 0;
        points.forEach( point => {
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
        this.createControlPointPath();
    }
    createPath() {
        this.createRectPath();
    }
    draw() {
        this.isEditing && this.drawControlPoint();
        this.drawCurve();
    }
}
export class Line extends Shape {
    constructor({ ctx, filled, fillStyle, strokeStyle, beginX, beginY, endX, endY, startRadians }) {
        super({ ctx, strokeStyle, filled, fillStyle, startRadians });
        this.radius = Math.sqrt(Math.pow(Math.abs(beginX - endX), 2) + Math.pow(Math.abs(beginY-endY), 2));
        this.points = [{ x: beginX, y: beginY }, { x: endX, y: endY } ];
        this.setCenter();
    }
    setCenter() {
        let { points: [ beginPoint ] } = this;
        this.x = beginPoint.x;
        this.y = beginPoint.y;
    }
    createControlPointPath() {
        let { ctx, points, pointRadius } = this;
        ctx.beginPath();
        points.forEach(point => {
                let { x, y } = point;
                ctx.arc(x, y, pointRadius, 0, 2 * Math.PI, false);
            });
    }
    drawControlPoint() {
        let { ctx, pointRadius, points } = this;
        points.forEach(point => {
            let { x, y } = point;
            ctx.beginPath();
            ctx.arc(x, y, pointRadius, 0, 2 * Math.PI, false);
            this.drawPath({ filled: true });
        });
    }
    createEditPath() {
        this.createControlPointPath();
    }
    updatePointAfterRotated() {
        let { points: [ beginPoint, endPoint ] } = this;
        endPoint.x -= beginPoint.x;
        endPoint.y -= beginPoint.y;
        let point = this.getTransformPointToScreenPoint({ x: endPoint.x, y: endPoint.y });
        endPoint.x = point.x;
        endPoint.y = point.y;
    }
    rotate(radians = 0) {
        let { ctx, points: [ beginPoint, endPoint ], points } = this;
        let { x, y } = beginPoint;
        let tPoints = JSON.parse(JSON.stringify(points));
        ctx.save();

        this.setShapeTransform({ radians, tx: x, ty: y });

        beginPoint.x = 0;
        beginPoint.y = 0;
        endPoint.x -= x;
        endPoint.y -= y;

        this.draw();
        ctx.restore();

        this.points = tPoints;
    }
    createRectPath() {
        let { points: [ beginPoint, endPoint ], ctx, pointRadius } = this;
        ctx.beginPath();
        let minX = Math.min(beginPoint.x, endPoint.x) - pointRadius,
            minY = Math.min(beginPoint.y, endPoint.y) - pointRadius,
            width = Math.abs(beginPoint.x - endPoint.x) + 2 * pointRadius,
            height = Math.abs(beginPoint.y - endPoint.y) + 2 * pointRadius;
        ctx.rect(minX, minY, width, height);
    }
    createPath() {
        this.createRectPath();
    }
    savePointOffset(loc) {
        let { points: [ beginPoint, endPoint ] } = this;
        this.offsets = [];
        this.offsets.push({ offsetX: loc.x - beginPoint.x, offsetY: loc.y - beginPoint.y });
        this.offsets.push({ offsetX: loc.x - endPoint.x, offsetY: loc.y - endPoint.y });
    }
    updatePointsOnMoving(loc) {
        let { points: [ beginPoint, endPoint ], offsets } = this;
        beginPoint.x = loc.x - offsets[0].offsetX;
        beginPoint.y = loc.y - offsets[0].offsetY;
        endPoint.x = loc.x - offsets[1].offsetX;
        endPoint.y = loc.y - offsets[1].offsetY;
        this.setCenter();
    }
    createLinePath() {
        let { points: [ beginPoint, endPoint ], ctx } = this;
        ctx.beginPath();
        ctx.moveTo(beginPoint.x, beginPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
    }
    drawLine() {
        this.createLinePath();
        this.drawPath();
    }
    draw() {
        let { isEditing } = this;
        isEditing && this.drawControlPoint();
        this.drawLine();
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
    rotate(radians = 0) {
        let { ctx, x, y } = this;

        ctx.save();
        this.setShapeTransform({ radians, tx: x, ty: y });
        this.x = 0;
        this.y = 0;

        this.draw();
        ctx.restore();

        this.x = x;
        this.y = y;
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
