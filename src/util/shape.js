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
    stroke() {
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
