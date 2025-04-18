import { Rectangle } from "../../common/rectangle.js";
import { ProgramEvent } from "../../core/interface.js";
import { Flip } from "../../gfx/interface.js";
import { Player } from "../player.js";
import { Enemy } from "./enemy.js";


const GRAVITY : number = 2.5;
const JUMP_TIME : number = 45;


export class Mushroom extends Enemy {


    private jumpTimer : number = 0;
    private jumping : boolean = false;


    constructor(x : number, y : number) {

        super(x, y);

        this.speedTarget.y = GRAVITY;

        this.sprite.setFrame(0, 1);

        this.jumpTimer = (Math.floor(x/16) % 2 == 0) ? JUMP_TIME*2 : JUMP_TIME;

        this.collisionBox = new Rectangle(0, 4, 4, 12);
        this.hitbox = new Rectangle(0, 4, 12, 12);

        this.friction.y = 0.1;
    }


    protected bounceEvent(event : ProgramEvent) : void {
        
        this.jumpTimer = JUMP_TIME;
        if (this.jumping) {

            this.speed.y = GRAVITY;
            this.sprite.setFrame(0, 1);
        }
    }


    protected verticalCollisionEvent(dir : -1 | 1, event : ProgramEvent) : void {
        
        if (dir == 1 && this.jumping) {

            this.jumpTimer = JUMP_TIME;
            this.jumping = false;
        }
    }


    protected playerEvent(player : Player, event : ProgramEvent) : void {
        
        if (this.bounceTimer > 0) {

            return;
        }

        this.flip = Flip.None;
        if (player.getPosition().x > this.pos.x) {

            this.flip = Flip.Horizontal;
        }
    }


    protected updateAI(event : ProgramEvent) : void {
        
        const JUMP_HEIGHT : number = -3.25;
        const FRAME_THRESHOLD : number = 0.5;

        if (this.bounceTimer <= 0 && this.jumpTimer > 0) {

            this.sprite.setFrame(0, 1);
            this.jumpTimer -= event.tick;

            if (this.jumpTimer <= 0) {

                this.speed.y = JUMP_HEIGHT;
                this.jumping = true;

                event.audio.playSample(event.assets.getSample("jump2"), 0.40);
            }
            else {

                return;
            }
        }

        let frame : number = 0;
        if (this.speed.y < -FRAME_THRESHOLD) {

            frame = 1;
        }
        else if (this.speed.y > FRAME_THRESHOLD) {

            frame = 2;
        }
        this.sprite.setFrame(frame, 1);
    }
}