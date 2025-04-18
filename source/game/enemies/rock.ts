import { Rectangle } from "../../common/rectangle.js";
import { ProgramEvent } from "../../core/interface.js";
import { Flip } from "../../gfx/interface.js";
import { Enemy } from "./enemy.js";


const GRAVITY : number = 4.0;
// "Walking" indeed
const WALK_SPEED : number = 1.0;

const SAMPLE_VOL : number = 0.80;


export class Rock extends Enemy {


    constructor(x : number, y : number) {

        super(x, y);

        this.speedTarget.y = GRAVITY;

        this.direction = ((x/16) | 0) % 2 == 0 ? 1 : -1;

        this.sprite.setFrame(4, 3);

        this.collisionBox = new Rectangle(0, 2, 16, 16);
        this.hitbox = new Rectangle(0, 4, 12, 12);

        this.bounceAnimation = false;
        this.checkEnemyCollisions = true;

        this.radius = 8;
    }


    protected bounceEvent(event : ProgramEvent, initial : boolean = false) : void {

        if (initial && this.speed.y < 0) {

            this.speed.y = Math.abs(this.speed.y);
        }
    }


    protected verticalCollisionEvent(dir : -1 | 1, event : ProgramEvent) : void {
        
        const JUMP_SPEED : number = -4.25;
        if (dir == 1) {

            this.speed.y = JUMP_SPEED;
            event.audio.playSample(event.assets.getSample("hit"), SAMPLE_VOL);
        }

        // event.audio.playSample(event.assets.getSample("hit"), SAMPLE_VOL);
    }


    protected horizontalCollisionEvent(dir : -1 | 1, event : ProgramEvent) : void {
        
        this.direction = -dir;
        this.speedTarget.x = this.direction*WALK_SPEED;
        this.speed.x = this.direction*WALK_SPEED;

       //  event.audio.playSample(event.assets.getSample("hit"), SAMPLE_VOL);
    }


    protected enemyCollisionEvent(e : Enemy, event : ProgramEvent) : void {
        
        this.direction = e.getPosition().x > this.pos.x ? -1 : 1;

        this.speedTarget.x = WALK_SPEED*this.direction;
        this.speed.x = this.speedTarget.x;

        // event.audio.playSample(event.assets.getSample("hit"), SAMPLE_VOL);
    }


    protected updateAI(event : ProgramEvent) : void {
        
        this.speedTarget.x = this.direction*WALK_SPEED;
        if (!this.touchGround && this.didTouchGround) {

            this.direction *= -1;
            this.speed.x *= -1;
            this.speedTarget.x *= -1;
        }
        this.sprite.animate(3, 4, 7, 7, event.tick);

        this.flip = this.direction < 0 ? Flip.None : Flip.Horizontal;
    }
}