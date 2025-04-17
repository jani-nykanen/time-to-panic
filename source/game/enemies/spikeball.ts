import { Rectangle } from "../../common/rectangle.js";
import { Assets, ProgramEvent } from "../../core/interface.js";
import { Bitmap, Canvas, Flip } from "../../gfx/interface.js";
import { Player } from "../player.js";
import { Enemy } from "./enemy.js";


const DISTANCE : number = 40;


export class Spikeball extends Enemy {


    private angle : number = 0.0;


    constructor(x : number, y : number) {

        super(x, y);

        this.sprite.setFrame(4, 2);

        this.direction = Math.floor(this.pos.x/16) % 2 == 0 ? -1 : 1;

        this.angle = Math.PI - this.direction*Math.PI/2;

        this.takeCollisions = false;
        this.hitbox = new Rectangle(0, 0, 10, 10);

        this.canBeBounced = false;
        this.bounceAnimation = false;

        this.cameraCheckArea.x = DISTANCE*2 + 16;
        this.cameraCheckArea.y = DISTANCE*2 + 16;

        this.computePosition();
    }


    private computePosition() : void {

        this.pos.x = this.initialPos.x + this.direction*Math.cos(this.angle)*DISTANCE;
        this.pos.y = this.initialPos.y + Math.sin(this.angle)*DISTANCE;
    }


    protected updateAI(event : ProgramEvent) : void {
        
        const ROTATION_SPEED : number = Math.PI*2/150;

        this.computePosition();

        this.angle = (this.angle + ROTATION_SPEED*event.tick) % (Math.PI*2);
    }


    public draw(canvas : Canvas, assets : Assets, bmp : Bitmap | undefined, shadowLayer : boolean = false) : void {

        const CHAIN_COUNT : number = 6;

        if (!this.exist || !this.inCamera) {

            return;
        }

        const dx : number = this.pos.x - this.sprite.width/2;
        const dy : number = this.pos.y - this.sprite.height/2;

        const distDelta : number = DISTANCE/CHAIN_COUNT;
        const c : number = this.direction*Math.cos(this.angle);
        const s : number = Math.sin(this.angle);

        for (let i : number = 0; i < CHAIN_COUNT; ++ i) {

            const distance : number = distDelta*i;

            const chainx : number = Math.round(this.initialPos.x + c*distance);
            const chainy : number = Math.round(this.initialPos.y + s*distance);

            canvas.drawBitmap(bmp, Flip.None, chainx - 12, chainy - 12, 120, 48, 24, 24);
        }


        if (!shadowLayer) {

            const colorMod : number = (1.0 + Math.sin(this.angle*2))/2.0;
            canvas.setColor(255, 255*colorMod + 73*(1.0 - colorMod), 255*colorMod + 36*(1.0 - colorMod));
        }
        this.sprite.draw(canvas, bmp, dx, dy, this.flip);
        if (!shadowLayer) {

            canvas.setColor();
        }
    }
}