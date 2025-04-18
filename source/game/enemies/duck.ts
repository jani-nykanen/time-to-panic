import { Rectangle } from "../../common/rectangle.js";
import { ProgramEvent } from "../../core/interface.js";
import { Flip } from "../../gfx/interface.js";
import { Enemy } from "./enemy.js";


const FLY_SPEED : number = 0.40;


export class Duck extends Enemy {


    private wave : number = 0.0;


    constructor(x : number, y : number) {

        super(x, y);

        this.direction = ((x/16) | 0) % 2 == 0 ? 1 : -1;
        if (this.direction == 1) {

            this.wave += Math.PI;
        }
 
        this.sprite.setFrame(0, 3);

        this.collisionBox = new Rectangle(0, 0, 12, 20);
        this.hitbox = new Rectangle(0, 0, 14, 12);
    }


    protected bounceEvent(event : ProgramEvent) : void {
        
        this.speed.x = 0;
        this.speedTarget.x = 0;
    }


    protected horizontalCollisionEvent(dir : -1 | 1, event : ProgramEvent) : void {
        
        this.direction = -dir;
        this.speedTarget.x = this.direction*FLY_SPEED;
        this.speed.x = this.direction*FLY_SPEED;
    }


    protected updateAI(event : ProgramEvent) : void {
        
        const WAVE_SPEED : number = Math.PI*2/90.0;
        const AMPLITUDE : number = 6.0;

        if (this.bounceTimer > 0) {

            return;
        }

        this.wave = (this.wave + WAVE_SPEED*event.tick) % (Math.PI*2);
        this.pos.y = this.initialPos.y + Math.sin(this.wave)*AMPLITUDE;

        this.speedTarget.x = this.direction*FLY_SPEED;

        this.sprite.animate(3, 0, 3, 7, event.tick);

        this.flip = this.direction < 0 ? Flip.None : Flip.Horizontal;
    }
}