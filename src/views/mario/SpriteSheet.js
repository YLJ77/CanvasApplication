export default class SpriteSheet{
    constructor({img, spriteWidth, spriteHeight}) {
        this.img = img;
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.tiles = new Map();
    }
    define({ name, imgXSizeUnit, imgYSizeUnit }) {
        const buffer = document.createElement('canvas');
        buffer.width = this.spriteWidth;
        buffer.height = this.spriteHeight;
        buffer.getContext('2d').
            drawImage(this.img,
                imgXSizeUnit * this.spriteWidth,
                imgYSizeUnit * this.spriteHeight,
                this.spriteWidth,   // sw
                this.spriteHeight,  // sh
                0,
                0,
                this.spriteWidth,   // spriteWidth
                this.spriteHeight   // spriteHeight
            );
        this.tiles.set(name, buffer);
    }
    draw({ name, ctx, dx, dy }) {
        const buffer = this.tiles.get(name);
        ctx.drawImage(buffer, dx, dy);
    }
    drawTile({ name, ctx, imgXSizeUnit, imgYSizeUnit }) {
        this.draw({ name, ctx, dx: imgXSizeUnit * this.spriteWidth, dy: imgYSizeUnit * this.spriteHeight });
    }
}