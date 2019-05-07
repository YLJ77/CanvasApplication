import { drawGrid } from './appFunc'
export class Eraser {
    constructor({ type, width, ctx }) {
        this.ctx = ctx;
        this.type = type;
        this.width = width;
        this.ERASER_LINE_WIDTH = 1;

        this.ERASER_SHADOW_COLOR = 'rgb(0,0,0)';
        this.ERASER_SHADOW_STYLE = 'blue';
        this.ERASER_STROKE_STYLE = 'rgb(0,0,255)';
        this.ERASER_SHADOW_OFFSET = -5;
        this.ERASER_SHADOW_BLUR = 20;
    }
    setDrawPath(loc) {
        let { width, ctx, type } = this;
        let eraserWidth = parseFloat(width);

        ctx.beginPath();

        if (type === 'circle') {
            ctx.arc(loc.x, loc.y, eraserWidth/2, 0, Math.PI*2, false);
        }
        else {
            ctx.rect(loc.x - eraserWidth/2,
                loc.y - eraserWidth/2,
                eraserWidth, eraserWidth);
        }
        ctx.clip();
    }
    setErasePath(loc) {
        let { width, ctx, type, ERASER_LINE_WIDTH } = this;

        ctx.beginPath();
        if (type === 'circle') {
            ctx.arc(loc.x, loc.y, width/2 + ERASER_LINE_WIDTH, 0, Math.PI*2, false);
        }
        else {
            ctx.rect(loc.x - width/2 - ERASER_LINE_WIDTH,
                loc.y - width/2 - ERASER_LINE_WIDTH,
                width + ERASER_LINE_WIDTH*2,
                width + ERASER_LINE_WIDTH*2);
        }
        ctx.clip();
    }
    setEraserAttributes() {
        let { ctx, ERASER_LINE_WIDTH, ERASER_SHADOW_BLUR, ERASER_SHADOW_OFFSET, ERASER_SHADOW_STYLE, ERASER_STROKE_STYLE } = this;
        ctx.lineWidth     = ERASER_LINE_WIDTH;
        ctx.shadowColor   = ERASER_SHADOW_STYLE;
        ctx.shadowOffsetX = ERASER_SHADOW_OFFSET;
        ctx.shadowOffsetY = ERASER_SHADOW_OFFSET;
        ctx.shadowBlur    = ERASER_SHADOW_BLUR;
        ctx.strokeStyle   = ERASER_STROKE_STYLE;
    }
    eraseLast(loc) {
        let { ctx } = this;
        let GRID_HORIZONTAL_SPACING = 10,
            GRID_VERTICAL_SPACING = 10,
            GRID_LINE_COLOR = 'lightblue';
        ctx.save();

        this.setErasePath(loc);
        ctx.fillStyle = 'white';
        ctx.fill();
        drawGrid({ctx, color: GRID_LINE_COLOR, stepx: GRID_HORIZONTAL_SPACING, stepy: GRID_VERTICAL_SPACING});

        ctx.restore();
    }
    drawEraser(loc) {
        let { ctx } = this;
        ctx.save();

        this.setEraserAttributes();
        this.setDrawPath(loc);
        ctx.stroke();

        ctx.restore();
    }
}