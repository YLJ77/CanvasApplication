import { Vec2 } from "@/views/mario/math";

export default class Entity {
    constructor({ sprite }) {
        this.sprite = sprite;
        this.pos = new Vec2(0, 0);
        this.vel = new Vec2(0, 0);
        this.traits = [];
    }
    update({ deltaTime }) {
        this.traits.forEach(trait => {
           trait.update({ entity: this, deltaTime });
        });
    }
    addTrait(trait) {
        this.traits.push(trait);
        this[trait.NAME] = trait;
    }
    draw({ ctx }) {
        const { pos } = this;
        ctx.drawImage(this.sprite, pos.x, pos.y);
    }
}