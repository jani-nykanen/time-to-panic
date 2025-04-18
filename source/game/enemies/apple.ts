import { Rectangle } from "../../common/rectangle.js";
import { Vector } from "../../common/vector.js";
import { ProgramEvent } from "../../core/interface.js";
import { Flip } from "../../gfx/interface.js";
import { Camera } from "../camera.js";
import { Player } from "../player.js";
import { Enemy } from "./enemy.js";


const DROP_GRAVITY : number = 6.0;
const RETURN_SPEED : number = -0.75;

const WAIT_TIME : number = 60;


export class Apple extends Enemy {


    private waitTimer : number = 0;
    private mode : number = 0;

    private startShaking : boolean = false;


    constructor(x : number, y : number) {

        super(x, y - 3);

        this.sprite.setFrame(3, 1);

        this.collisionBox = new Rectangle(0, 2, 4, 16);
        this.hitbox = new Rectangle(0, 0, 14, 12);

        this.friction.y = 0.15;
    }


    protected verticalCollisionEvent(dir : -1 | 1, event : ProgramEvent) : void {
        
        if (dir == 1 && this.mode == 1) {

            this.mode = 2;
            this.waitTimer = WAIT_TIME;

            this.speedTarget.zero();

            this.startShaking = true;

            event.audio.playSample(event.assets.getSample("shake"), 0.60);
        }
        else if (dir == -1 && this.mode == 3) {

            this.mode = 0;
            this.speedTarget.zero();

            this.pos.y = this.initialPos.y;
        }
    }


    protected playerEvent(player : Player, event : ProgramEvent) : void {
        
        const DROP_ACTIVATE_DISTANCE : number = 40;

        const ppos : Vector = player.getPosition();
        
        if (this.mode == 0 && ppos.y > this.pos.y - 8 && 
            Math.abs(this.pos.x - ppos.x) < DROP_ACTIVATE_DISTANCE) {

            this.mode = 1;
            this.speedTarget.y = DROP_GRAVITY;
        }
    }


    protected bounceEvent(event : ProgramEvent) : void {

        if (this.mode == 3) {

            this.speed.y = 0.0;
            this.speedTarget.y = 0.0;
        }
    }


    protected updateAI(event : ProgramEvent, camera? : Camera) : void {
        
        this.sprite.setFrame(3 + this.mode, 1);

        // A lazy workaround
        if (this.startShaking) {

            camera?.shake(4, 45);
            this.startShaking = false;
        }

        if (this.bounceTimer > 0) {

            return;
        }

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