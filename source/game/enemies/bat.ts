import { Rectangle } from "../../common/rectangle.js";
import { ProgramEvent } from "../../core/interface.js";
import { Flip } from "../../gfx/interface.js";
import { Enemy } from "./enemy.js";


const FLY_SPEED : number = 0.33;


export class Bat extends Enemy {


    constructor(x : number, y : number) {

        super(x, y);

        this.direction = ((x/16) | 0) % 2 == 0 ? 1 : -1;

        this.sprite.setFrame(0, 2);

        this.collisionBox = new Rectangle(0, 0, 16, 10);
        this.hitbox = new Rectangle(0, 0, 14, 10);
    }


    protected bounceEvent(event : ProgramEvent) : void {
        
        this.speed.y = 0;
        this.speedTarget.y = 0;
    }


    protected verticalCollisionEvent(dir : -1 | 1, event : ProgramEvent) : void {
        
        this.direction = -dir;
        this.speedTarget.y = this.direction*FLY_SPEED;
        this.speed.y = this.direction*FLY_SPEED;
    }


    protected updateAI(event : ProgramEvent) : void {
        
        if (this.bounceTimer > 0) {

            return;
        }

        this.speedTarget.y = this.direction*FLY_SPEED;
        this.sprite.animate(2, 0, 3, 7, event.tick);

    }
}