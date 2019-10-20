<template>
    <canvas style="border: 1px solid #ccc;" ref="screen" width="640" height="640"></canvas>
</template>

<script>
    import { loadLevel } from "./loaders";
    import { loadBackgroundSprites, loadMarioSprites } from "@/views/mario/sprites";
    import { createBackgroundLayer, createSpriteLayer } from "@/views/mario/layers";
    import Compositor from './Compositor'
    import Entity from './Entity'
    import Timer from './Timer'
    import Keyboard from './Keyboard'
    import Velocity from './traits/Velocity'
    import Jump from './traits/Jump'

    export default {
        data() {
            return {
                ctx: null
            }
        },
        methods: {
            initContext() {
                this.ctx = this.$refs.screen.getContext('2d');
            },
            main() {
                const { ctx } = this;
                Promise.all([
                    loadBackgroundSprites(),
                    loadMarioSprites(),
                    loadLevel({ url: 'levels/1.json' })
                ]).then(([backgroundSprites, marioSprites, level]) => {
                    const gravity = 2000;
                    // const gravity = 10;
                    const mario = new Entity({ sprite: marioSprites.tiles.get('idle') });
                    const comp = new Compositor();
                    const backgroundLayer = createBackgroundLayer({ backgrounds: level.backgrounds, sprites: backgroundSprites })
                    const spriteLayer = createSpriteLayer({ entity: mario});
                    const  input = new Keyboard();
                    const SPACE = 32;

                    comp.layers.push(
                        backgroundLayer,
                        spriteLayer);
                    mario.pos.set(64, 180);
                    mario.vel.set(0, -4200);
                    mario.addTrait(new Velocity());
                    mario.addTrait(new Jump());
                    input.addMapping({
                        keyCode: SPACE,
                        callback: keyState => {
                            if (keyState) {
                                mario.jump.start();
                            } else {
                                mario.jump.cancel();
                            }
                        }
                    });
                    input.listenTo(window);
                    comp.draw(ctx);
                    const timer = new Timer({
                        update: deltaTime => {
                            mario.update({ deltaTime });
                            comp.draw(ctx);
                            mario.vel.y += gravity * deltaTime;
                        }
                    });
                    timer.start();
                });
            }
        },
        mounted() {
            this.initContext();
            this.main();
        }
    }
</script>