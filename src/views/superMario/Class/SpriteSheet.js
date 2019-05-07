export class SpriteSheet {
    constructor(image, width, height) {
        this.image = image;
        this.width = width;
        this.height = height;
        this.tiles = new Map();
        this.animations = new Map();
    }

    defineAnim(name, animation) {
        this.animations.set(name, animation);
    }

    define(name, x, y, width, height) {
        const buffers = [false, true].map(flip => {
            let { image } = this;
            const buffer = document.createElement('canvas');
            buffer.width = width;
            buffer.height = height;
            const ctx = buffer.getContext('2d');
            if (flip) {
                ctx.scale(-1, 1);
                ctx.translate(-width, 0);
            }
            ctx.drawImage(
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
            return buffer;
        });
        this.tiles.set(name, buffers);
    }
    defineTile(name, x, y) {
        let { width, height } = this;
        this.define(name, x * width, y * height, width, height);

    }
    draw(name, ctx, x, y, flip = false) {
        const buffer = this.tiles.get(name)[Number(flip)];
        ctx.drawImage(buffer, x, y);
    }

    drawAnim(name, ctx, x, y, distance) {
        const animation = this.animations.get(name);
        this.drawTile(animation(distance), ctx, x, y);
    }

    drawTile(name, ctx, x, y) {
        let { width, height } = this;
        this.draw(name, ctx, x * width, y * height);
    }
}