import { Entity } from "./Entity";
import { loadMarioSprites } from "../sprite";

export async function createMario(ctx) {
    const mario = new Entity();
    let marioSprite = await loadMarioSprites(ctx);
    mario.pos.set(64, 180);
    mario.vel.set(2, -10);

    mario.draw = function drawMario(ctx) {
        marioSprite.draw('idle', ctx, this.pos.x, this.pos.y);
    }

    mario.update = function updateMario() {
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
    }

    return mario;
}

















