import { Rectangle } from "../../common/rectangle.js";
import { ProgramEvent } from "../../core/interface.js";
import { Flip } from "../../gfx/interface.js";
import { Enemy } from "./enemy.js";


const GRAVITY : number = 4.0;
const WALK_SPEED : number = 0.5;


export class Walker extends Enemy {


    constructor(x : number, y : number) {

        super(x, y);

        this.speedTarget.y = GRAVITY;

        this.direction = ((x/16) | 0) % 2 == 0 ? 1 : -1;

        this.sprite.setFrame(0, 0);

        this.collisionBox = new Rectangle(0, 4, 4, 12);
        this.hitbox = new Rectangle(0, 4, 12, 12)
    }


    protected horizontalCollisionEvent(dir : -1 | 1, event : ProgramEvent) : void {
        
        this.direction = -dir;
        this.speedTarget.x = this.direction*WALK_SPEED;
        this.speed.x = this.direction*WALK_SPEED;
    }


    protected updateAI(event : ProgramEvent) : void {
        
        this.speedTarget.x = this.direction*WALK_SPEED;
        if (!this.touchGround && this.didTouchGround) {

            this.direction *= -1;
            this.speed.x *= -1;
            this.speedTarget.x *= -1;
        }
        this.sprite.animate(0, 0, 3, 7, event.tick);

        this.flip = this.direction < 0 ? Flip.None : Flip.Horizontal;
    }
}