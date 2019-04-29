import { Entity } from "./Entity";
import { loadMarioSprites } from "../sprite";

export async function createMario(ctx) {
    const mario = new Entity();
    let marioSprite = await loadMarioSprites(ctx);

    mario.draw = function drawMario(ctx) {
        marioSprite.draw('idle', ctx, this.pos.x, this.pos.y);
    }

    mario.update = function updateMario(deltaTime) {
        this.pos.x += this.vel.x * deltaTime;
        this.pos.y += this.vel.y * deltaTime;
    }

    return mario;
}

















