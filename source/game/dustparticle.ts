import { Vector } from "../common/vector.js";
import { Assets, InputState, ProgramEvent } from "../core/interface.js";
import { Canvas, Bitmap, Flip } from "../gfx/interface.js";
import { GameObject } from "./gameobject.js";
import { AnimatedSprite } from "../gfx/sprite.js";
import { Camera } from "./camera.js";


export class DustParticle extends GameObject {


    private sprite : AnimatedSprite;
    private id : number = 0;


    constructor() {

        super(0, 0, false);

        this.friction.y = 0.025;

        this.sprite = new AnimatedSprite(16, 16);

        this.cameraCheckArea = new Vector(0, 0, 32, 32);
    }


    protected updateEvent(camera : Camera, event : ProgramEvent) : void {
        
        const FRAME_TIME : number = 8;

        this.sprite.animate(this.id, 0, 4, FRAME_TIME, event.tick);
        if (this.sprite.column == 4) {

            this.exist = false;
        }
    }


    public draw(canvas : Canvas, assets : Assets | undefined, bmp : Bitmap | undefined) : void {
        
        if (!this.exist || !this.inCamera) {

            return;
        }

        this.sprite.draw(canvas, bmp, this.pos.x - this.sprite.width/2, this.pos.y - this.sprite.height/2);
    }


    public spawn(x : number, y : number, speedx : number, speedy : number, id : number = 0) : void {

        this.pos = new Vector(x, y);
        this.speed = new Vector(speedx, speedy);
        this.speedTarget.x = speedx;
        this.speedTarget.y = 0.0;

        this.dying = false;
        this.exist = true;

        this.id = id;

        this.sprite.setFrame(0, id);
    }
}
