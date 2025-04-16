import { Vector } from "./../common/vector.js";
import { Assets, ProgramEvent } from "./../core/interface.js";
import { Canvas, Bitmap, Flip } from "./../gfx/interface.js";
import { SpecialCollider } from "./specialcollider.js";
import { AnimatedSprite } from "./../gfx/sprite.js";
import { Camera } from "./camera.js";
import { Rectangle } from "./../common/rectangle.js";
import { Player } from "./player.js";
import { Direction } from "./direction.js";
import { clamp } from "../common/mathutil.js";


export class Spring extends SpecialCollider {


    private direction : Direction = Direction.None;

    private bounceTimer : number = 0.0;


    constructor(x : number, y : number, direction : Direction) {

        super(x, y);
        
        this.direction = direction;

        this.cameraCheckArea = new Vector(64, 64);

        this.hitbox = new Rectangle(0, 0, 14, 14);
    }


    private checkUpSpring(player : Player, event : ProgramEvent) : boolean {

        const SPEED_THRESHOLD : number = -0.5;
        const NEAR_MARGIN : number = 2;
        const FAR_MARGIN : number = 8;
        const EXTRA_WIDTH : number = 8;
        const LEVEL_OFF : number = 2;

        const BOUNCE_SPEED : number = 6.0;

        const yspeed : number = player.getSpeed().y;
        if (yspeed < SPEED_THRESHOLD) {

            return false;
        }
        
        const ppos : Vector = player.getPosition();

        const cbox : Rectangle = player.getCollisionBox();
        const bottom : number = ppos.y + cbox.y + cbox.h/2;

        const left : number = ppos.x + cbox.x - cbox.w/2;
        const right : number = left + cbox.w;

        const width : number = this.hitbox.w + EXTRA_WIDTH;
        const dx : number = this.pos.x + this.hitbox.x - width/2;

        const level : number = this.pos.y + this.hitbox.y - this.hitbox.h/2 + LEVEL_OFF;
        if (right < dx || left > dx + width ||
            bottom < level - NEAR_MARGIN*event.tick ||
            bottom > level + (FAR_MARGIN + Math.abs(yspeed))*event.tick) {

            return false;
        }

        player.makeJump(BOUNCE_SPEED, event);
        this.bounceTimer = 1.0;

        return true;
    }


    public playerCollision(player : Player, camera : Camera, event : ProgramEvent) : void {
        
        if (this.direction == Direction.Up) {

            this.checkUpSpring(player, event);
            return;
        }
    }


    protected updateEvent(camera : Camera, event : ProgramEvent) : void {
        
        const BOUNCE_ANIM_SPEED : number = 1.0/12.0;

        if (this.bounceTimer > 0) {

            this.bounceTimer -= BOUNCE_ANIM_SPEED*event.tick;
        }
    }


    public draw(canvas : Canvas, assets : Assets | undefined, bmp : Bitmap | undefined) : void {
        
        if (!this.isActive()) {

            return;
        }

        const dx : number = this.pos.x - 12;
        const dy : number = this.pos.y - 16;

        let sx : number = 0;
        if (this.bounceTimer > 0) {

            sx = clamp(1 + Math.floor((1.0 - this.bounceTimer)*3), 1, 3)*24;
        }

        canvas.drawBitmap(bmp, Flip.None, dx, dy, sx, 0, 24, 24);
    }
}


