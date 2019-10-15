import { Vec2 } from "@/views/mario/math";

export default class Entity {
    constructor({ sprite }) {
        this.sprite = sprite;
        this.pos = new Vec2(0, 0);
        this.vel = new Vec2(0, 0);
    }
    update() {
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
    }
    draw({ ctx }) {
        const { pos } = this;
        ctx.drawImage(this.sprite, pos.x, pos.y);
    }
}