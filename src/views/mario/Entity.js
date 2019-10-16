import { Vec2 } from "@/views/mario/math";

export default class Entity {
    constructor({ sprite }) {
        this.sprite = sprite;
        this.pos = new Vec2(0, 0);
        this.vel = new Vec2(0, 0);
    }
    update({ deltaTime }) {
        if (deltaTime > 0.1) return;
        this.pos.x += this.vel.x * deltaTime;
        this.pos.y += this.vel.y * deltaTime;
    }
    draw({ ctx }) {
        const { pos } = this;
        ctx.drawImage(this.sprite, pos.x, pos.y);
    }
}