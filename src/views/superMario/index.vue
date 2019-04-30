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
    import { createMario } from "./Class/entities";
    import { createCollisionLayer } from "./layers";
    import { setupKeyboard } from "./input";

    export default {
        data() {
            return {
                canvas: null,
                ctx: null
            }
        },
        methods: {
            async draw() {
                let { ctx, canvas } = this;
                const mario = await createMario(ctx);
                const level = await loadLevel('1-1', ctx);
                mario.pos.set(14, 64);
                level.entities.add(mario);
                level.comp.layers.push(createCollisionLayer(level));

                const input = setupKeyboard(mario);
                input.listenTo(window);

                ['mousedown', 'mousemove'].forEach(eventName => {
                    canvas.addEventListener(eventName, event => {
                        if (event.buttons === 1) {
                            mario.vel.set(0, 0);
                            mario.pos.set(event.offsetX, event.offsetY);
                        }
                    })
                });

                const timer = new Timer(1/60);
                timer.update = function update(deltaTime) {
                    // mario.update(deltaTime);
                    level.update(deltaTime);
                    level.comp.draw(ctx);
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