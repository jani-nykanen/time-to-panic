import { Rectangle } from "../common/rectangle.js";
import { ProgramEvent } from "../core/interface.js";
import { GameObject } from "./gameobject.js";


export class CollisionObject extends GameObject {


    protected collisionBox : Rectangle;
    protected takeCollisions : boolean = true;


    constructor(x : number, y : number, exist : boolean = true) {

        super(x, y, exist);

        this.collisionBox = new Rectangle(0, 0, 16, 16);
    }


    protected verticalCollisionEvent?(dir : -1 | 1, event : ProgramEvent) : void;
    protected horizontalCollisionEvent?(dir : -1 | 1, event : ProgramEvent) : void;


    public verticalCollision(x : number, y : number, w : number, dir : -1 | 1, event : ProgramEvent) : boolean {

        const SAFE_MARGIN_NEAR : number = 1.0;
        const SAFE_MARGIN_FAR : number = 4.0;
    
        if (!this.takeCollisions || !this.isActive()) {
    
            return false;
        }
    
        const px : number = this.pos.x + this.collisionBox.x - this.collisionBox.w/2;
        const py : number = this.pos.y + this.collisionBox.y + this.collisionBox.h/2*dir;
        const oldY : number = this.oldPos.y + this.collisionBox.y + this.collisionBox.h/2*dir;
        
        if (px > x + w || px + this.collisionBox.w < x || this.speed.y*dir < 0) {
    
            return false;
        }

        const bottom : boolean = dir > 0 && 
            py >= y - (SAFE_MARGIN_NEAR)*event.tick &&
            oldY <= y + (SAFE_MARGIN_FAR + Math.abs(this.speed.y))*event.tick;
        const top : boolean = dir < 0 && 
            py <= y + (SAFE_MARGIN_NEAR)*event.tick &&
            oldY >= y - (SAFE_MARGIN_FAR + Math.abs(this.speed.y))*event.tick;

        if (bottom || top) {
    
            this.pos.y = y - this.collisionBox.y - this.collisionBox.h/2*dir;
            this.speed.y = 0.0
                
            this.verticalCollisionEvent?.(dir, event);
    
            return true;
        }
        return false;
    }


    public horizontalCollision(x : number, y : number, h : number, dir : -1 | 1, event : ProgramEvent) : boolean {

        const SAFE_MARGIN_NEAR : number = 1.0;
        const SAFE_MARGIN_FAR : number = 4.0;
    
        if (!this.takeCollisions || !this.isActive()) {
    
            return false;
        }
    
        const px : number = this.pos.x + this.collisionBox.x + this.collisionBox.w/2*dir;
        const py : number = this.pos.y + this.collisionBox.y - this.collisionBox.h/2;
        const oldX : number = this.oldPos.x + this.collisionBox.x + this.collisionBox.w/2*dir;
        
        if (py > y + h || py + this.collisionBox.h < y || this.speed.x*dir < 0) {
    
            return false;
        }

        const right : boolean = (dir > 0 && 
            px >= x - (SAFE_MARGIN_NEAR)*event.tick &&
            oldX <= x + (SAFE_MARGIN_FAR + Math.abs(this.speed.x))*event.tick);
        const left : boolean = (dir < 0 && 
            px <= x + (SAFE_MARGIN_NEAR)*event.tick &&
            oldX >= x - (SAFE_MARGIN_FAR + Math.abs(this.speed.x))*event.tick );

        if (right || left) {
    
            this.pos.x = x - this.collisionBox.x - this.collisionBox.w/2*dir;
            this.speed.x = 0.0
                
            this.horizontalCollisionEvent?.(dir, event);
    
            return true;
        }
        return false;
    }


    public doesTakeCollisions() : boolean {

        return this.takeCollisions;
    }
}
