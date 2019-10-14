export default class SpriteSheet{
    constructor({img, spriteWidth, spriteHeight}) {
        this.img = img;
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.tiles = new Map();
    }
    define({ name, imgX, imgY, spriteWidth, spriteHeight }) {
        const buffer = document.createElement('canvas');
        buffer.width = this.spriteWidth;
        buffer.height = this.spriteHeight;
        buffer.getContext('2d').
            drawImage(this.img,
                imgX,
                imgY,
                spriteWidth,   // sw
                spriteHeight,  // sh
                0,
                0,
                spriteWidth,   // spriteWidth
                spriteHeight   // spriteHeight
            );
        this.tiles.set(name, buffer);
    }
    defineTile({ name, widthTimes, heightTimes }) {
        const { spriteWidth, spriteHeight } = this;
        this.define({
            name,
            imgX: widthTimes * spriteWidth,
            imgY: heightTimes * spriteHeight,
            spriteWidth,
            spriteHeight
        })
    }
    draw({ name, ctx, dx, dy }) {
        const buffer = this.tiles.get(name);
        ctx.drawImage(buffer, dx, dy);
    }
    drawTile({ name, ctx, widthTimes, heightTimes }) {
        this.draw({ name, ctx, dx: widthTimes * this.spriteWidth, dy: heightTimes * this.spriteHeight });
    }
}