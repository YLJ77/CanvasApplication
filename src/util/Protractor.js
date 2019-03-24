export class Protractor {
    constructor({ ctx, shape, loc, rotatingLockRadians }) {
        this.ctx = ctx;
        this.shape = shape;
        this.loc = loc;
        this.rotatingLockRadians = rotatingLockRadians;

        this.RADIUS = 10;
        this.STROKE_STYLE = 'rgba(0, 0, 0, 0.8)';
        this.FILL_STYLE ='rgba(255, 255, 255, 0.2)';
        this.SHADOW_COLOR = 'rgba(255, 255, 255, 0.4)';

        this.DEGREE_RING_MARGIN = 35;
        this.TRACKING_RING_MARGIN = 55;
        this.DEGREE_ANNOTATIONS_FILL_STYLE = 'rgba(0, 0, 230, 0.8)';
        this.DEGREE_ANNOTATIONS_TEXT_SIZE = 11;
        this.DEGREE_OUTER_RING_MARGIN = this.DEGREE_RING_MARGIN;
        this.TICK_WIDTH = 10;
        this.TICK_LONG_STROKE_STYLE = 'rgba(100, 140, 230, 0.9)';
        this.TICK_SHORT_STROKE_STYLE = 'rgba(100, 140, 230, 0.7)';

        this.TRACKING_RING_STROKING_STYLE = 'rgba(100, 140, 230, 0.3)';
    }
    drawCentroid() {  // 量角器圆心
        let { ctx, shape: { x, y }, STROKE_STYLE, FILL_STYLE, SHADOW_COLOR, RADIUS } = this;
        ctx.beginPath();
        ctx.save();
        ctx.strokeStyle = STROKE_STYLE;
        ctx.fillStyle = FILL_STYLE;
        ctx.shadowColor = SHADOW_COLOR;
        ctx.arc(x, y, RADIUS, 0, Math.PI*2, false);
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    }
    drawCentroidGuidewire() {  //  导线
        let { loc, shape, ctx, FILL_STYLE, TRACKING_RING_MARGIN, rotatingLockRadians } = this;
        let radians = Math.atan( (loc.y - shape.y) / (loc.x - shape.x) ),
            radius, endpt;

        radius = shape.radius + TRACKING_RING_MARGIN;
        radians = radians - rotatingLockRadians;

        if (loc.x >= shape.x) {
            endpt = {
                x: shape.x + radius * Math.cos(radians),
                y: shape.y + radius * Math.sin(radians)
            };
        }
        else {
            endpt = {
                x: shape.x - radius * Math.cos(radians),
                y: shape.y - radius * Math.sin(radians)
            };
        }

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(shape.x, shape.y);
        ctx.lineTo(endpt.x, endpt.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(endpt.x, endpt.y, 5, 0, Math.PI*2, false);
        ctx.stroke();
        ctx.fillStyle = FILL_STYLE;
        ctx.fill();

        ctx.restore();
    }
    drawDegreeOuterDial() { // 刻度盘外层圆环
        let { ctx, shape, DEGREE_OUTER_RING_MARGIN } = this;
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        // ctx.beginPath();
        ctx.arc(shape.x, shape.y,
            shape.radius + DEGREE_OUTER_RING_MARGIN,
            0, Math.PI*2, true);
        ctx.stroke();
        ctx.restore();
    }
    drawDegreeAnnotations() {   // 度数数字
        let { shape, TICK_WIDTH, DEGREE_RING_MARGIN, ctx, DEGREE_ANNOTATIONS_FILL_STYLE, DEGREE_ANNOTATIONS_TEXT_SIZE } = this;
        let radius = shape.radius + DEGREE_RING_MARGIN;
        ctx.save();
        ctx.fillStyle = DEGREE_ANNOTATIONS_FILL_STYLE;
        ctx.font = DEGREE_ANNOTATIONS_TEXT_SIZE + 'px Helvetica';

        for (let radians=0; radians < 2*Math.PI; radians += Math.PI/8) {
            ctx.beginPath();
            ctx.fillText((radians * 180 / Math.PI).toFixed(0),
                shape.x + Math.cos(radians) * (radius - TICK_WIDTH*2),
                shape.y + Math.sin(radians) * (radius - TICK_WIDTH*2));

        }
        ctx.restore();
    }
    drawDegreeDialTicks() { // 刻度线
        let { shape, DEGREE_RING_MARGIN, ctx, TICK_WIDTH, TICK_LONG_STROKE_STYLE, TICK_SHORT_STROKE_STYLE } = this;
        let radius = shape.radius + DEGREE_RING_MARGIN,
            ANGLE_MAX = 2*Math.PI,
            ANGLE_DELTA = Math.PI/64;

        ctx.save();

        for (let radians = 0, cnt = 0; radians < ANGLE_MAX; radians += ANGLE_DELTA, ++cnt) {
            ctx.beginPath();

            if (cnt % 4 === 0) {
                ctx.moveTo(shape.x + Math.cos(radians) * (radius - TICK_WIDTH),
                    shape.y + Math.sin(radians) * (radius - TICK_WIDTH));
                ctx.lineTo(shape.x + Math.cos(radians) * (radius),
                    shape.y + Math.sin(radians) * (radius));
                ctx.strokeStyle = TICK_LONG_STROKE_STYLE;
                ctx.stroke();
            }
            else {
                ctx.moveTo(shape.x + Math.cos(radians) * (radius - TICK_WIDTH/2),
                    shape.y + Math.sin(radians) * (radius - TICK_WIDTH/2));
                ctx.lineTo(shape.x + Math.cos(radians) * (radius),
                    shape.y + Math.sin(radians) * (radius));
                ctx.strokeStyle = TICK_SHORT_STROKE_STYLE;
                ctx.stroke();
            }

            ctx.restore();
        }
    }
    drawDegreeInnerDial() { //  刻度盘内层圆环
        let { shape, ctx, DEGREE_RING_MARGIN, TICK_WIDTH } = this;
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.radius + DEGREE_RING_MARGIN - TICK_WIDTH, 0, Math.PI*2, false);
        ctx.stroke();
        ctx.restore();
    }
    drawOutMostDial() {    //  最外层圆环
        let { shape, ctx, TRACKING_RING_STROKING_STYLE, TRACKING_RING_MARGIN } = this;
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowOffsetX = 3,
            ctx.shadowOffsetY = 3,
            ctx.shadowBlur = 6,
            ctx.strokeStyle = TRACKING_RING_STROKING_STYLE;
        // ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.radius +
            TRACKING_RING_MARGIN, 0, Math.PI*2, false);
        ctx.stroke();
        ctx.restore();
    }
    draw() {
        let { ctx } = this;
        this.drawCentroid();
        this.drawCentroidGuidewire();
        ctx.beginPath();
        this.drawOutMostDial();
        this.drawDegreeOuterDial();
        ctx.fillStyle = 'rgba(100, 140, 230, 0.1)';
        ctx.fill();

        ctx.beginPath();
        this.drawDegreeOuterDial();
        ctx.stroke();

        this.drawDegreeDialTicks();
        this.drawDegreeInnerDial();
        this.drawDegreeAnnotations();
    }
}