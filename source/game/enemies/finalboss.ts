import { Rectangle } from "../../common/rectangle.js";
import { Vector } from "../../common/vector.js";
import { Assets, ProgramEvent } from "../../core/interface.js";
import { Bitmap, Canvas, Flip } from "../../gfx/interface.js";
import { Player } from "../player.js";
import { Enemy } from "./enemy.js";


const GRAVITY : number = 2.5;


export class FinalBoss extends Enemy {


    constructor(x : number, y : number) {

        super(x, y);

        this.speedTarget.y = GRAVITY;

        this.sprite.setFrame(0, 1);

        this.collisionBox = new Rectangle(0, 4, 4, 12);
        this.hitbox = new Rectangle(0, 0, 48, 64);

        this.friction.y = 0.1;
    
        this.cameraCheckArea = new Vector(80, 64);
    }


    protected bounceEvent(event : ProgramEvent) : void {
        
        // ...
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
        
        // ...
    }


    public draw(canvas : Canvas, assets : Assets | undefined) : void {
        
        const bmp : Bitmap | undefined = assets?.getBitmap("final_boss");

        const dx : number = this.pos.x - 32;
        const dy : number = this.pos.y - 56 + 1;

        canvas.drawBitmap(bmp, this.flip, dx, dy, 0, 0, 64, 64);
    }
}