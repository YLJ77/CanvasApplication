import { Entity } from "./Entity";
import { loadMarioSprites } from "../sprite";
import Velocity from '../traits/Velocity'
import Jump from '../traits/Jump'


export async function createMario(ctx) {
    const mario = new Entity();
    let marioSprite = await loadMarioSprites(ctx);

    mario.addTrait(new Velocity());
    mario.addTrait(new Jump());
    mario.draw = function drawMario(ctx) {
        marioSprite.draw('idle', ctx, this.pos.x, this.pos.y);
    }

    return mario;
}

















