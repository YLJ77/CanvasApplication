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
    import Timer from './Timer'
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
                const mario = await createMario(ctx);
                const gravity = 30;
                mario.pos.set(64, 180);
                mario.vel.set(200, -300);
                const spriteLayer = createSpriteLayer(mario);
                comp.layers.push(spriteLayer);
                const timer = new Timer(1/60);
                timer.update = function update(deltaTime) {
                    comp.draw(ctx);
                    mario.update(deltaTime);
                    mario.vel.y += gravity;
                };
                timer.start();
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