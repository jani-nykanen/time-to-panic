import { Vector } from "../common/vector.js";
import { ProgramEvent} from "../core/interface.js";
import { Canvas } from "../gfx/interface.js";
import { GameObject } from "./gameobject.js";


export class Camera {
    

    private pos : Vector;
    private startPos : Vector;
    private target : Vector;
    private moveDirection : Vector;

    private viewWidth : number;
    private viewHeight : number;

    private moving : boolean = false;
    private moveTimer : number = 0;
    private moveSpeed : number = 1.0/16.0;

    private shakeTimer : number = 0;
    private shakeAmount : number = 0;


    public get width() : number {

        return this.viewWidth;
    }
    public get height() : number {

        return this.viewHeight;
    }
    public get position() : Vector {

        return this.pos.clone();
    }
    public get targetPosition() : Vector {

        return this.target.clone();
    }


    constructor(x : number = 0, y : number = 0, event : ProgramEvent) {

        this.pos = new Vector(x, y);
        this.startPos = this.pos.clone();
        this.target = this.pos.clone();
        this.moveDirection = new Vector();

        this.viewWidth = event.screenWidth;
        this.viewHeight = event.screenHeight;
    }


    private updateMovement(event : ProgramEvent) : void {

        this.moveTimer -= this.moveSpeed*event.tick;
        if (this.moveTimer <= 0.0) {

            this.moveTimer = 0.0;

            this.moving = false;
            this.pos.makeEqual(this.target);
            this.startPos.makeEqual(this.pos);

            return;
        }

        const t : number = this.moveTimer;

        this.pos.x = t*this.startPos.x + (1.0 - t)*this.target.x;
        this.pos.y = t*this.startPos.y + (1.0 - t)*this.target.y;
    }


    public move(dirx : number, diry : number, moveSpeed : number = 1.0/32.0) : void {

        if (this.moving) {

            return;
        }

        this.startPos.makeEqual(this.pos);

        this.moveTimer = 1.0;
        this.moveSpeed = moveSpeed;

        this.target.x = this.pos.x + dirx*this.width;
        this.target.y = this.pos.y + diry*this.height;

        this.moveDirection.x = dirx;
        this.moveDirection.y = diry;

        this.moving = true;
    }


    public update(event : ProgramEvent) : void {

        this.viewWidth = event.screenWidth;
        this.viewHeight = event.screenHeight;

        if (this.shakeTimer > 0) {

            this.shakeTimer -= event.tick;
        }

        if (this.moving) {

            this.updateMovement(event);
        }
    }


    public apply(canvas : Canvas, applyShake : boolean = true) : void {

        if (applyShake && this.shakeTimer > 0) {

            const shakex : number = Math.round(Math.random()*this.shakeAmount*2.0) - this.shakeAmount;
            const shakey : number = Math.round(Math.random()*this.shakeAmount*2.0) - this.shakeAmount;

            canvas.moveTo(-this.pos.x + shakex, -this.pos.y + shakey);
            return;
        }
        canvas.moveTo(-this.pos.x, -this.pos.y);
    }


    public isInside(center : Vector, size : Vector) : boolean {

        const left : number = center.x - size.x/2;
        const top : number = center.y - size.y/2;

        return left + size.x >= this.pos.x &&
               top + size.y >= this.pos.y &&
               left <= this.pos.x + this.viewWidth &&
               top <= this.pos.y + this.viewHeight;
    }


    public isMoving() : boolean {

        return this.moving;
    }


    public getMoveDirection() : Vector {

        return this.moveDirection.clone();
    }


    public getMoveSpeed() : number {

        return this.moveSpeed;
    }


    public isShaking() : boolean {

        return this.shakeTimer > 0;
    }


    public shake(amount : number, time : number) : void {

        this.shakeAmount = amount;
        this.shakeTimer = time;
    }


    public focusTo(target : Vector) : void {

        this.pos.x = Math.floor((target.x)/this.width)*this.width;
        this.pos.y = Math.floor((target.y)/this.height)*this.height;

        this.target = this.pos.clone();
    }


    public reset() : void {

        this.moving = false;
        this.moveTimer = 0.0;
        
        this.pos.zero()
        this.startPos.zero();
        this.target.zero()
        this.moveDirection.zero()
    }
}
