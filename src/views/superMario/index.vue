<template>
    <div>
        <canvas id="screen" width="640" height="640">canvas not supported</canvas>
    </div>
</template>

<style lang="scss" scoped>
    canvas {
        border: 1px solid #ccc;
    }
</style>

<script>
    import { SpriteSheet } from "./Class/SpriteSheet";
    import tiles from '../../assets/img/tiles.png'
    import { loadImage, loadLevel } from "./loaders";

    export default {
        data() {
            return {
                canvas: null,
                ctx: null
            }
        },
        methods: {
            drawBackground(background, sprites) {
                let { ctx } = this;
                background.ranges.forEach(([x1, x2, y1, y2]) => {
                    for(let x=x1; x<x2; ++x) {
                        for (let y=y1; y<y2; ++y) {
                            sprites.drawTile(background.tile, ctx, x, y);
                        }
                    }
                })
            },
            async draw() {
                let image = await loadImage(tiles);
                const sprites = new SpriteSheet(image, 16, 16);
                sprites.define('ground', 0, 0);
                sprites.define('sky', 3, 23);

                let level = await loadLevel('1-1');
                level.backgrounds.forEach(background => {
                    this.drawBackground(background, sprites)
                });
            },
            init() {
                this.canvas = document.getElementById('screen');
                this.ctx = this.canvas.getContext('2d');
            }
        },
        mounted() {
            this.init();
            this.draw();
        }
    }
</script>