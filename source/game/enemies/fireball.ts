import { Rectangle } from "../../common/rectangle.js";
import { Vector } from "../../common/vector.js";
import { Assets, ProgramEvent } from "../../core/interface.js";
import { Bitmap, Canvas, Flip } from "../../gfx/interface.js";
import { Player } from "../player.js";
import { Enemy } from "./enemy.js";


const GRAVITY : number = 3.0;
const RECOVER_TIME : number = 60;


export class Fireball extends Enemy {


    private jumping : boolean = false;
    private recoverTimer : number = 0;


    constructor(x : number, y : number) {

        super(x, y);

        this.sprite.setFrame(5, 4);

        this.collisionBox = new Rectangle(0, 4, 4, 12);
        this.hitbox = new Rectangle(0, 4, 12, 12);

        this.friction.y = 0.075;
        
        this.canBeBounced = false;
        this.bounceAnimation = false;
        this.takeCollisions = false;
    }



    protected playerEvent(player : Player, event : ProgramEvent) : void {
        
        const JUMP_ACTIVATE_DISTANCE : number = 40;
        const JUMP_SPEED : number = -4.0;
        
        if (this.recoverTimer > 0 || this.jumping) {

            return;
        }

        const ppos : Vector = player.getPosition();    
        if (Math.abs(this.pos.x - ppos.x) < JUMP_ACTIVATE_DISTANCE) {
        
            this.jumping = true;
            this.speed.y = JUMP_SPEED;
        }
    }


    protected updateAI(event : ProgramEvent) : void {
        
        this.sprite.animate(4, 0, 3, 4, event.tick);

        if (this.jumping) {

            this.speedTarget.y = GRAVITY;
            if (this.speed.y > 0.0 && this.pos.y >= this.initialPos.y) {

                this.pos.y = this.initialPos.y;
                this.jumping = false;
                this.speed.y = 0.0;
                this.speedTarget.y = 0.0;

                this.recoverTimer = RECOVER_TIME;
            }
            return;
        }
      
        this.speedTarget.y = 0.0;
        if (this.recoverTimer > 0) {

            this.recoverTimer -= event.tick;
        }
    }


    public draw(canvas : Canvas, assets : Assets | undefined, bmp : Bitmap | undefined) : void {
        
        if (!this.isActive()) {

            return;
        }

        const dx : number = this.pos.x - 12;
        const dy : number = this.pos.y - 12;

        this.sprite.draw(canvas, bmp, dx, dy, this.flip);

        // Lava
        canvas.drawBitmap(bmp, Flip.None, dx, this.initialPos.y - 18, 120, 96, 24, 24);
        canvas.drawBitmap(bmp, Flip.None, dx, this.initialPos.y + 6, 120, 108, 24, 12);

        // Face
        canvas.drawBitmap(bmp, Flip.None, dx, dy, 96, 96, 24, 24);
    }
}