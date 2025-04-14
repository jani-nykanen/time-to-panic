import { ExistingObject } from "./existingobject.js";
import { Vector } from "../common/vector.js";
import { Rectangle, overlayRect } from "../common/rectangle.js";
import { Bitmap, Canvas } from "../gfx/interface.js";
import { approachTargetValue } from "../common/utility.js";
import { ProgramEvent, Assets } from "../core/interface.js";
import { Camera } from "./camera.js";


export class GameObject implements ExistingObject {


    protected exist : boolean = true;
    protected dying : boolean = false;

    protected pos : Vector;
    protected oldPos : Vector;

    protected speed : Vector;
    protected speedTarget : Vector;
    protected friction : Vector;

    protected hitbox : Rectangle;

    protected inCamera : boolean = false;
    protected cameraCheckArea : Vector;


    constructor(x : number = 0, y : number = 0, exist : boolean = false) {

        this.pos = new Vector(x, y);
        this.oldPos = this.pos.clone();

        this.speed = new Vector();
        this.speedTarget = new Vector();
        this.friction = new Vector(1, 1);

        this.hitbox = new Rectangle(0, 0, 16, 16)

        this.cameraCheckArea = new Vector(0, 0, 32, 32);

        this.exist = exist;
    }


    protected updateEvent?(camera : Camera, event : ProgramEvent) : void;
    protected postMovementEvent?(event : ProgramEvent) : void;
    protected cameraEvent?(enteredCamera : boolean, camera : Camera, event : ProgramEvent) : void;
    protected cameraMovementEvent?(camera : Camera, event : ProgramEvent) : void;
    protected die?(event : ProgramEvent) : boolean;


    protected updateMovement(event : ProgramEvent) : void {

        this.speed.x = approachTargetValue(this.speed.x, this.speedTarget.x, this.friction.x*event.tick);
        this.speed.y = approachTargetValue(this.speed.y, this.speedTarget.y, this.friction.y*event.tick);

        this.pos.x += this.speed.x*event.tick;
        this.pos.y += this.speed.y*event.tick;
    }


    public draw?(canvas : Canvas, assets? : Assets | undefined, bmp? : Bitmap | undefined) : void;


    public cameraCheck(camera : Camera, event : ProgramEvent) : void {

        if (!this.exist) {

            return;
        }
        
        const wasInCamera : boolean = this.inCamera;
        this.inCamera = camera.isInside(this.pos, this.cameraCheckArea);

        const enteredCamera : boolean = this.inCamera && this.inCamera != wasInCamera;
        this.cameraEvent?.(enteredCamera, camera, event);
        
        if (this.dying && !this.inCamera) {

            this.exist = false;
        }
    }


    public update(camera : Camera, event : ProgramEvent) : void {

        if (!this.exist) {
            
            return;
        }

        this.oldPos.makeEqual(this.pos);

        if (this.dying) {

            if (this.die?.(event) ?? true) {

                this.exist = false;
                this.dying = false;
            }
            return;
        }

        if (camera.isMoving()) {

            this.cameraMovementEvent?.(camera, event);
            return;
        }

        this.updateEvent?.(camera, event);
        this.updateMovement(event);
        this.postMovementEvent?.(event);
    }

    
    public doesExist = () : boolean => this.exist;
    public isDying = () : boolean => this.dying;
    public isActive = () : boolean => this.inCamera && this.exist && !this.dying;

    public getPosition = () : Vector => this.pos.clone();
    public getSpeed = () : Vector => this.speed.clone();
    public getHitbox = () : Rectangle => this.hitbox.clone();

    public overlayRect = (shift : Vector, hitbox : Rectangle) : boolean => overlayRect(this.pos, this.hitbox, shift, hitbox);
    public overlayObject = (o : GameObject) : boolean => overlayRect(this.pos, this.hitbox, o.pos, o.hitbox);


    public forceKill() : void {
        
        this.exist = false;
        this.dying = false;
    }


    public distanceTo(o : GameObject) : number {

        return Vector.distance(this.pos, o.pos);
    }


    public setSpeed(speedx : number, speedy : number) : void {

        this.speed.x = speedx;
        this.speed.y = speedy;
    }


    public setPosition(x : number, y : number) : void {

        this.pos.x = x;
        this.pos.y = y;
    }
}
