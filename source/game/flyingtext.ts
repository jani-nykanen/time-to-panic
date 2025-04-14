import { ProgramEvent, Assets } from "../core/interface.js";
import { Align, Bitmap, Canvas, Flip } from "../gfx/interface.js";
import { RGBA } from "../common/rgba.js";
import { Vector } from "../common/vector.js";
import { GameObject } from "./gameobject.js";
import { Camera } from "./camera.js";


const FLY_TIME : number = 16;
const WAIT_TIME : number = 30;
const FADE_TIME : number = 15;


export class FlyingText extends GameObject {


    private value : number = 0;
    private timer : number = 0;

    private color : RGBA;


    constructor() {

        super(0, 0, false);

        this.color = new RGBA();

        this.cameraCheckArea = new Vector(64, 64);
    }


    public spawn(x : number, y : number, value : number, 
        color : RGBA = new RGBA(255, 255, 255)) : void {
        
        this.pos.x = x;
        this.pos.y = y;

        this.value = value;

        this.timer = 0;

        this.color = color.clone();

        this.exist = true;
    }


    public updateEvent(camera : Camera, event : ProgramEvent) : void {

        const FLY_SPEED : number = -1.75;

        this.timer += event.tick;
        if (this.timer < FLY_TIME) {

            this.pos.y += FLY_SPEED*event.tick;
        }

        if (this.timer >= FLY_TIME + WAIT_TIME + FADE_TIME) {

            this.exist = false;
        }
    }


    public draw(canvas : Canvas, assets : Assets | undefined, bmp : Bitmap | undefined) : void {

        if (!this.isActive()) {

            return;
        }

        const sign : string = this.value < 0 ? "-" : "";
        const str : string = sign + "$" + String(Math.floor(Math.abs(this.value)));

        const dx : number = this.pos.x;
        const dy : number = this.pos.y - 8;

        let alpha : number = 1.0;
        if (this.timer >= FLY_TIME + WAIT_TIME) {

            alpha = 1.0 - (this.timer - (FLY_TIME + WAIT_TIME))/FADE_TIME;
        }

        canvas.setColor(this.color.r, this.color.g, this.color.b, this.color.a*alpha);
        canvas.drawText(bmp, str, dx, dy, -7, 0, Align.Center);
    }
}