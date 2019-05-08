import { Entity } from "./Entity";
import { loadSpriteSheet } from "../loaders";
import Jump from '../traits/Jump'
import Go from '../traits/Go'
import { createAnim } from "../anim";

export async function createMario() {
    let marioSprite = await loadSpriteSheet('mario');
    const mario = new Entity();
    mario.size.set(16, 16);

    mario.addTrait(new Go());
    mario.addTrait(new Jump());

    const runAnim = createAnim(['run-1', 'run-2', 'run-3'], 10);
    function routeFrame(mario) {
        if (!mario.jump.ready) {
            return 'jump';
        }

        if (mario.go.distance > 0) {
            if (mario.vel.x > 0 && mario.go.dir < 0 || mario.vel.x < 0 && mario.go.dir > 0) {
                return 'break';
            }
            return runAnim(mario.go.distance);
        }
        return 'idle';
    }
    mario.draw = function drawMario(ctx) {
        marioSprite.draw(routeFrame(this), ctx, 0, 0, mario.go.heading < 0);
    }

    return mario;
}

















