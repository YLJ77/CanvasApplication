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
    import Keyboard from './Class/KeyBoardState'

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
                const mario = await createMario(ctx);
                let backgroundSprite = await loadBackgroundSprites(ctx);
                let level = await loadLevel('1-1');
                let comp = new Compositor();
                const backgroundLayer = createBackgroundLayer(level.backgrounds, backgroundSprite)
                comp.layers.push(backgroundLayer);
                const gravity = 2000;
                mario.pos.set(14, 180);

                const SPACE = 32;
                const input = new Keyboard();
                input.addMapping(SPACE, keyState => {
                    if (keyState) {
                        mario.jump.start();
                    } else {
                        mario.jump.cancel();
                    }
                });
                input.listenTo(window);

                const spriteLayer = createSpriteLayer(mario);
                comp.layers.push(spriteLayer);
                const timer = new Timer(1/60);
                timer.update = function update(deltaTime) {
                    mario.update(deltaTime);
                    comp.draw(ctx);
                    mario.vel.y += gravity * deltaTime;
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