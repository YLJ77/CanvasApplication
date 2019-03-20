export class Centroid {
    constructor({ ctx, polygon, loc, rotatingLockAngle }) {
        this.ctx = ctx;
        this.polygon = polygon;
        this.loc = loc;
        this.rotatingLockAngle = rotatingLockAngle;

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
        let { ctx, polygon: { x, y }, STROKE_STYLE, FILL_STYLE, SHADOW_COLOR, RADIUS } = this;
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
        let { loc, polygon, ctx, FILL_STYLE, TRACKING_RING_MARGIN, rotatingLockAngle } = this;
        var angle = Math.atan( (loc.y - polygon.y) / (loc.x - polygon.x) ),
            radius, endpt;

        radius = polygon.radius + TRACKING_RING_MARGIN;
        angle = angle - rotatingLockAngle;

        if (loc.x >= polygon.x) {
            endpt = {
                x: polygon.x + radius * Math.cos(angle),
                y: polygon.y + radius * Math.sin(angle)
            };
        }
        else {
            endpt = {
                x: polygon.x - radius * Math.cos(angle),
                y: polygon.y - radius * Math.sin(angle)
            };
        }

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(polygon.x, polygon.y);
        ctx.lineTo(endpt.x, endpt.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(endpt.x, endpt.y, 5, 0, Math.PI*2, false);
        ctx.stroke();
        ctx.fillStyle = FILL_STYLE;
        ctx.fill();

        ctx.restore();
    }
}