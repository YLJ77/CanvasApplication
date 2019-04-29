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
    import { loadBackgroundSprites } from "./sprite";
    import { Compositor } from "./Class/Compositor";
    import { createMario } from "./Class/entities";
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
                let backgroundSprite = await loadBackgroundSprites(ctx);
                let level = await loadLevel('1-1');
                let comp = new Compositor();
                const backgroundLayer = createBackgroundLayer(level.backgrounds, backgroundSprite)
                comp.layers.push(backgroundLayer);
                const gravity = 0.5;
                const mario = await createMario(ctx);
                const spriteLayer = createSpriteLayer(mario);
                comp.layers.push(spriteLayer);
                let update = () => {
                    comp.draw(ctx);
                    mario.draw(ctx);
                    mario.update();
                    mario.vel.y += gravity;
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