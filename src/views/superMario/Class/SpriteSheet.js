export class SpriteSheet {
    constructor(image, width, height) {
        this.image = image;
        this.width = width;
        this.height = height;
        this.tiles = new Map();
    }
    define(name, x, y, width, height) {
        let { image } = this;
        const buffer = document.createElement('canvas');
        buffer.width = width;
        buffer.height = height;
        buffer
            .getContext('2d')
            .drawImage(
                image,
                x,
                y,
                width,
                height,
                0,
                0,
                width,
                height
            );
        this.tiles.set(name, buffer);
    }
    defineTile(name, x, y) {
        let { width, height } = this;
        this.define(name, x * width, y * height, width, height);

    }
    draw(name, ctx, x, y) {
        const buffer = this.tiles.get(name);
        ctx.drawImage(buffer, x, y);
    }
    drawTile(name, ctx, x, y) {
        let { width, height } = this;
        this.draw(name, ctx, x * width, y * height);
    }
}