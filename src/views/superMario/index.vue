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
    import { loadLevel } from "./loaders";
    import { loadBackgroundSprites, loadMarioSprites } from "./sprite";
    import { Compositor } from "./Class/Compositor";
    import { createBackgroundLayer, createSpriteLayer } from "./layers";

    export default {
        data() {
            return {
                canvas: null,
                ctx: null
            }
        },
        methods: {
            async draw() {
                let { ctx } = this;
                let marioSprite = await loadMarioSprites(ctx);
                let backgroundSprite = await loadBackgroundSprites(ctx);
                let level = await loadLevel('1-1');
                let comp = new Compositor();
                const backgroundLayer = createBackgroundLayer(level.backgrounds, backgroundSprite)
                comp.layers.push(backgroundLayer);
                const pos = {
                    x: 64,
                    y: 64
                };
                const spriteLayer = createSpriteLayer(marioSprite, pos);
                comp.layers.push(spriteLayer);
                let update = () => {
                    comp.draw(ctx);
                    marioSprite.draw('idle', ctx, pos.x, pos.y);
                    pos.x += 2;
                    pos.y += 2;
                    requestAnimationFrame(update);
                };
                update();
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