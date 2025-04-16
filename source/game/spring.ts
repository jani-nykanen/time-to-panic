import { Vector } from "./../common/vector.js";
import { Assets, ProgramEvent } from "./../core/interface.js";
import { Canvas, Bitmap, Flip } from "./../gfx/interface.js";
import { SpecialCollider } from "./specialcollider.js";
import { AnimatedSprite } from "./../gfx/sprite.js";
import { Camera } from "./camera.js";
import { Rectangle } from "./../common/rectangle.js";
import { Player } from "./player.js";
import { Direction } from "./direction.js";


export class Spring extends SpecialCollider {


    private direction : Direction = Direction.None;


    constructor(x : number, y : number, direction : Direction) {

        super(x, y);
        
        this.direction = direction;

        this.cameraCheckArea = new Vector(64, 64);

        this.hitbox = new Rectangle(0, 0, 16, 16);
    }


    public playerCollision(player : Player, camera : Camera, event : ProgramEvent) : void {
        
        // TODO: Implement
    }


    public draw(canvas : Canvas, assets : Assets | undefined, bmp : Bitmap | undefined) : void {
        
        if (!this.isActive()) {

            return;
        }

        const dx : number = this.pos.x - 12;
        const dy : number = this.pos.y - 16;

        canvas.drawBitmap(bmp, Flip.None, dx, dy, 0, 0, 24, 24);
    }
}


