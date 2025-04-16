import { Rectangle } from "../../common/rectangle.js";
import { Vector } from "../../common/vector.js";
import { ProgramEvent } from "../../core/interface.js";
import { Flip } from "../../gfx/interface.js";
import { Player } from "../player.js";
import { Enemy } from "./enemy.js";


const DROP_GRAVITY : number = 6.0;
const RETURN_SPEED : number = -0.75;

const WAIT_TIME : number = 60;


export class Apple extends Enemy {


    private waitTimer : number = 0;
    private mode : number = 0;


    constructor(x : number, y : number) {

        super(x, y + 1);

        this.sprite.setFrame(3, 1);

        this.collisionBox = new Rectangle(0, 1, 4, 17);
        this.hitbox = new Rectangle(0, 0, 14, 12);

        this.friction.y = 0.15;
    }


    protected verticalCollisionEvent(dir : -1 | 1, event : ProgramEvent) : void {
        
        if (dir == 1 && this.mode == 1) {

            this.mode = 2;
            this.waitTimer = WAIT_TIME;

            this.speedTarget.zero();

            // event.audio.playSample(event.assets.getSample("thwomp"), 0.50);

            // this.shakeEvent?.(30, 2);
        }
        else if (dir == -1 && this.mode == 3) {

            this.mode = 0;
            this.speedTarget.zero();

            this.pos.y = this.initialPos.y;
        }
    }


    protected playerEvent(player : Player, event : ProgramEvent) : void {
        
        const DROP_ACTIVATE_DISTANCE : number = 32;

        const ppos : Vector = player.getPosition();
        
        if (this.mode == 0 && ppos.y > this.pos.y - 8 && 
            Math.abs(this.pos.x - ppos.x) < DROP_ACTIVATE_DISTANCE) {

            this.mode = 1;
            this.speedTarget.y = DROP_GRAVITY;
        }
    }


    protected updateAI(event : ProgramEvent) : void {
        
        this.sprite.setFrame(3 + this.mode, 1);

        if (this.mode == 2) {

            this.waitTimer -= event.tick;
            if (this.waitTimer <= 0) {

                this.mode = 3;
            }
        }

        if (this.mode == 3) {

            this.speed.y = RETURN_SPEED;
            this.speedTarget.y = this.speed.y;

            if (this.pos.y <= this.initialPos.y) {

                this.pos.y = this.initialPos.y;
                this.mode = 0;
                this.speedTarget.zero();
                this.speed.zero();
            }
        }
    }
}