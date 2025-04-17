import { Vector } from "../common/vector.js";
import { Assets, ProgramEvent } from "../core/interface.js";
import { Canvas, Bitmap, Flip } from "../gfx/interface.js";
import { SpecialCollider } from "./specialcollider.js";
import { AnimatedSprite } from "../gfx/sprite.js";
import { Camera } from "./camera.js";
import { Rectangle } from "../common/rectangle.js";
import { Player } from "./player.js";
import { Direction } from "./direction.js";
import { clamp } from "../common/mathutil.js";


const H_MOVE_SPEED : number = 0.75;
const V_MOVE_SPEED : number = 0.75;


export class MovingPlatform extends SpecialCollider {


    private horizontal : boolean = false;


    constructor(x : number, y : number, horizontal : boolean = false) {

        super(x, y - 3);
        
        this.horizontal = horizontal;

        this.cameraCheckArea = new Vector(64, 64);
        
        if (horizontal) {

            this.collisionBox = new Rectangle(0, 0, 48, 2);
            this.speedTarget.x = H_MOVE_SPEED*(((x/16) |0) % 2 == 0 ? 1 : -1);
        }
        else {

            this.collisionBox = new Rectangle(0, 0, 16, 48);
            this.speedTarget.y = V_MOVE_SPEED*(((y/16) |0) % 2 == 0 ? 1 : -1);
        }
    }


    protected verticalCollisionEvent(dir: -1 | 1, event: ProgramEvent): void {
        
        if (this.horizontal) {

            return;
        }

        this.speedTarget.y = -Math.abs(this.speedTarget.y)*dir;
    }


    protected horizontalCollisionEvent(dir: -1 | 1, event: ProgramEvent): void {
        
        if (!this.horizontal) {

            return;
        }

        this.speedTarget.x = -Math.abs(this.speedTarget.x)*dir;
    }


    public playerCollision(player : Player, camera : Camera, event : ProgramEvent) : void {
        
        if (!this.isActive()) {

            return;
        } 

        if (player.verticalCollision(this.pos.x - 24, this.pos.y - 5, 48, 1, event)) {

            player.setReferenceObject(this);
        }
    }


    protected updateEvent(camera : Camera, event : ProgramEvent) : void {
        
        this.speed = this.speedTarget.clone();

        const left : number = Math.floor(this.pos.x/camera.width)*camera.width;
        const right : number = left + camera.width;

        this.horizontalCollision(left, 0, camera.height, -1, event);
        this.horizontalCollision(right, 0, camera.height, 1, event);

        this.verticalCollision(left, 0, camera.width, -1, event);
        this.verticalCollision(left, camera.height, camera.width, 1, event);
    }


    public draw(canvas : Canvas, assets : Assets | undefined, bmp : Bitmap | undefined) : void {
        
        if (!this.isActive()) {

            return;
        }

        const dx : number = this.pos.x - 24;
        const dy : number = this.pos.y - 5;

        canvas.drawBitmap(bmp, Flip.None, dx, dy, 0, 24, 48, 10);
    }
}


