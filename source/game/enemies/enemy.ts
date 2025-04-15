import { Vector } from "../../common/vector.js";
import { Assets, InputState, ProgramEvent } from "../../core/interface.js";
import { Canvas, Bitmap, Flip } from "../../gfx/interface.js";
import { CollisionObject } from "../collisionobject.js";
import { AnimatedSprite } from "../../gfx/sprite.js";
import { Camera } from "../camera.js";
import { ObjectGenerator } from "../objectgenerator.js";
import { DustParticle } from "../dustparticle.js";
import { Rectangle } from "../../common/rectangle.js";
import { GameState } from "../gamestate.js";
import { Stage } from "../stage.js";
import { FlyingText } from "../flyingtext.js";
import { RGBA } from "../../common/rgba.js";
import { Player } from "../player.js";


export class Enemy extends CollisionObject {


    protected touchGround : boolean = false;
    protected didTouchGround : boolean = false;

    protected sprite : AnimatedSprite;
    protected flip : Flip = Flip.None;

    protected direction : number = 0;

    protected bounceTimer : number = 0;


    constructor(x : number, y : number) {

        super(x, y, true);

        this.collisionBox = new Rectangle(0, 0, 12, 12);
        this.hitbox = new Rectangle(0, 0, 14, 14);

        this.sprite = new AnimatedSprite(24, 24);

        this.friction = new Vector(0.15, 0.15);

        this.cameraCheckArea = new Vector(32, 32);
    }


    private checkBounce(player : Player, event : ProgramEvent) : boolean {

        const SPEED_EPS : number = -0.5;
        const NEAR_MARGIN : number = 2;
        const FAR_MARGIN : number = 8;
        const EXTRA_WIDTH : number = 12;

        const BOUNCE_SPEED : number = 3.0;

        const yspeed : number = player.getSpeed().y;
        if (yspeed < SPEED_EPS) {

            return false;
        }
        
        const ppos : Vector = player.getPosition();

        const cbox : Rectangle = player.getCollisionBox();
        const bottom : number = ppos.y + cbox.y + cbox.h/2;

        const left : number = ppos.x + cbox.x - cbox.w/2;
        const right : number = left + cbox.w;

        const width : number = this.hitbox.w + EXTRA_WIDTH;
        const dx : number = this.pos.x + this.hitbox.x - width/2;

        const level : number = this.pos.y + this.hitbox.y - this.hitbox.h/2 - 4;
        if (right < dx || left > dx + width ||
            bottom < level - NEAR_MARGIN*event.tick ||
            bottom > level + (FAR_MARGIN + Math.abs(yspeed))*event.tick) {

            return false;
        }

        player.makeJump(BOUNCE_SPEED, event);
        this.bounceTimer = 1.0;
        return true;
    }


    protected playerEvent?(player : Player, event : ProgramEvent) : void;


    protected verticalCollisionEvent(dir : -1 | 1, event : ProgramEvent) : void {
        
        if (dir == 1) {

            this.touchGround = true;
        }
    }


    protected updateAI?(event : ProgramEvent) : void;


    protected updateEvent(camera : Camera, event : ProgramEvent) : void {
        
        const BOUNCE_ANIM_SPEED : number = 1.0/20.0;

        if (this.bounceTimer > 0) {

            this.speed.zero();
            this.speedTarget.zero();
            this.bounceTimer -= BOUNCE_ANIM_SPEED*event.tick;
        }
        else {

            this.updateAI?.(event);
        }

        const left : number = Math.floor(this.pos.x/camera.width)*camera.width;
        const right : number = left + camera.width;

        this.horizontalCollision(left, 0, camera.height, 1, event);
        this.horizontalCollision(right, 0, camera.height, 1, event);
        
        this.didTouchGround = this.touchGround;
        this.touchGround = false;
    }


    public playerCollision(player : Player, event : ProgramEvent) : void {

        if (!this.isActive() || !player.isActive()) {

            return;
        }

        this.playerEvent?.(player, event);

        if (this.checkBounce(player, event)) {

            return;
        }

        if (this.overlayObject(player)) {

            player.makeDie(event);
        }
    }


    public draw(canvas : Canvas, assets : Assets | undefined, bmp : Bitmap | undefined) : void {
        
        if (!this.exist || !this.inCamera) {

            return;
        }

        let dw : number = this.sprite.width;
        let dh : number = this.sprite.height;
        if (this.bounceTimer > 0) {

            if (this.bounceTimer > 0.5) {

                const t : number = 1.0 - (this.bounceTimer - 0.5)*2;
                const st : number = Math.sin(t*Math.PI);

                dw = this.sprite.width*(1.0 + 0.5*st);
                dh = this.sprite.height*(1.0 - 0.5*st);
            }
            else {

                const t : number = 1.0 - this.bounceTimer*2;
                const st : number = Math.sin(t*Math.PI);

                dw = this.sprite.width*(1.0 - 0.33*st);
                dh = this.sprite.height*(1.0 + 0.33*st);
            }

            dw = Math.floor(dw);
            dh = Math.floor(dh);
        }

        const dx : number = this.pos.x - dw/2;
        const dy : number = this.pos.y - (dh - this.sprite.height/2) + 1;

        this.sprite.draw(canvas, bmp, dx, dy, this.flip, dw, dh);
    }
}