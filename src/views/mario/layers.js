function drawBackground({ background, ctx, sprites }) {
    const {tile, ranges: [x1,x2,y1,y2]} = background;
    for (let widthTimes=x1; widthTimes<x2; widthTimes++) {
        for (let heightTimes=y1; heightTimes<y2; heightTimes++) {
            sprites.drawTile({ name: tile, ctx, widthTimes, heightTimes });
        }
    }
}

export function createBackgroundLayer({ backgrounds, sprites }) {
    const buffer = document.createElement('canvas');
    buffer.width = 256;
    buffer.height = 240;
    backgrounds.forEach(background => {
        drawBackground({ background, ctx: buffer.getContext('2d'), sprites });
    });
    return function (ctx) {
        ctx.drawImage(buffer, 0, 0);
    }
}
export function createSpriteLayer({ entity }) {
    return function (ctx) {
        entity.draw({ ctx });
    }
}
