import { Entity } from "./Entity";
import { loadMarioSprites } from "../sprite";
import Velocity from '../traits/Velocity'
import Jump from '../traits/Jump'
import Go from '../traits/Go'


export async function createMario(ctx) {
    let marioSprite = await loadMarioSprites(ctx);
    const mario = new Entity();
    mario.size.set(16, 16);

    mario.addTrait(new Go());
    mario.addTrait(new Jump());
    // mario.addTrait(new Velocity());
    mario.draw = function drawMario(ctx) {
        marioSprite.draw('idle', ctx, 0, 0);
    }

    return mario;
}

















