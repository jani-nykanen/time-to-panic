import { Vector } from "../../common/vector.js";
import { Assets, ProgramEvent } from "../../core/interface.js";
import { Canvas, Bitmap, Flip } from "../../gfx/interface.js";
import { CollisionObject } from "../collisionobject.js";
import { AnimatedSprite } from "../../gfx/sprite.js";
import { Camera } from "../camera.js";
import { Rectangle } from "../../common/rectangle.js";
import { Player } from "../player.js";


export class Enemy extends CollisionObject {


    protected touchGround : boolean = false;
    protected didTouchGround : boolean = false;

    protected sprite : AnimatedSprite;
    protected flip : Flip = Flip.None;

    protected direction : number = 0;

    protected bounceTimer : number = 0;
    protected starPos : Vector;

    protected canBeBounced : boolean = true;
    protected bounceAnimation : boolean = true;

    protected initialPos : Vector;

    protected canBeMoved : boolean = true;
    protected radius : number = 12;
    protected checkEnemyCollisions : boolean = false;
    protected harmful : boolean = true;


    constructor(x : number, y : number) {

        super(x, y, true);

        this.starPos = new Vector();

        this.initialPos = this.pos.clone();

        this.collisionBox = new Rectangle(0, 0, 12, 12);
        this.hitbox = new Rectangle(0, 0, 14, 14);

        this.sprite = new AnimatedSprite(24, 24);

        this.friction = new Vector(0.15, 0.15);

        this.cameraCheckArea = new Vector(32, 32);
    }


    private checkBounce(player : Player, event : ProgramEvent) : boolean {

        const SPEED_THRESHOLD : number = -0.5;
        const NEAR_MARGIN : number = 2;
        const FAR_MARGIN : number = 8;
        const EXTRA_WIDTH : number = 8;

        const BOUNCE_SPEED : number = 3.0;

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

        const level : number = this.pos.y + this.hitbox.y - this.hitbox.h/2 - 4;
        if (right < dx || left > dx + width ||
            bottom < level - NEAR_MARGIN*event.tick ||
            bottom > level + (FAR_MARGIN + Math.abs(yspeed))*event.tick) {

            return false;
        }

        player.makeJump(BOUNCE_SPEED, event);
        event.audio.playSample(event.assets.getSample("bounce"), 0.70);
        this.bounceTimer = 1.0;

        this.starPos.x = player.getPosition().x;
        this.starPos.y = level;

        this.bounceEvent?.(event, true);

        return true;
    }

    
    protected bounceEvent?(event : ProgramEvent, initial? : boolean) : void;
    protected playerEvent?(player : Player, event : ProgramEvent) : void;
    protected enemyCollisionEvent?(e : Enemy, event : ProgramEvent) : void;
    protected updateAI?(event : ProgramEvent, camera? : Camera) : void;


    protected verticalCollisionEvent(dir : -1 | 1, event : ProgramEvent) : void {
        
        if (dir == 1) {

            this.touchGround = true;
        }
    }

    
    protected updateEvent(camera : Camera, event : ProgramEvent) : void {
        
        const BOUNCE_ANIM_SPEED : number = 1.0/20.0;

        if (this.bounceTimer > 0) {

            this.bounceEvent?.(event, false);
            this.bounceTimer -= BOUNCE_ANIM_SPEED*event.tick;
        }

        this.updateAI?.(event, camera);

        const left : number = Math.floor(this.pos.x/camera.width)*camera.width;
        const right : number = left + camera.width;

        this.horizontalCollision(left, 0, camera.height, -1, event);
        this.horizontalCollision(right, 0, camera.height, 1, event);

        this.verticalCollision(left, 0, camera.width, -1, event);
        this.verticalCollision(left, camera.height, camera.width, 1, event);
        
        this.didTouchGround = this.touchGround;
        this.touchGround = false;
    }


    protected drawStars(canvas : Canvas, bmp : Bitmap | undefined) : void {

        const MAX_DISTANCE : number = 32;
        const FLATTEN_Y : number = 0.67;

        const t : number = 1.0 - this.bounceTimer;
        const s : number = (t*2.0) % 1.0;

        for (let i : number = 0; i < 4; ++ i) {

            const angle : number = Math.PI/4 + i*Math.PI/2;

            const dx : number = this.starPos.x + Math.sin(angle)*t*MAX_DISTANCE;
            const dy : number = this.starPos.y + Math.cos(angle)*t*MAX_DISTANCE*FLATTEN_Y;

            const sx : number = Math.floor(s*4);
            
            canvas.drawBitmap(bmp, Flip.None, dx - 8, dy - 8, 96 + sx*16, 0, 16, 16);
        }
    }


    public playerCollision(player : Player, event : ProgramEvent) : void {

        if (!this.isActive() || !player.isActive()) {

            return;
        }

        this.playerEvent?.(player, event);

        if (this.canBeBounced && this.checkBounce(player, event)) {

            return;
        }

        if (this.harmful && this.overlayObject(player)) {

            player.makeDie(event);
        }
    }


    public enemyCollision(enemy : Enemy, event : ProgramEvent) : void {

        if (!this.isActive() || !enemy.isActive() ||
            !this.checkEnemyCollisions || !enemy.checkEnemyCollisions) {

            return;
        }

        const dist : number = Vector.distance(enemy.pos, this.pos);
        const collisionDistance : number = this.radius + enemy.radius;

        if (dist >= collisionDistance) {

            return;
        }
            

        const direction : Vector = Vector.direction(enemy.pos, this.pos);
        const divisor : number = Number(this.canBeMoved) + Number(enemy.canBeMoved);

        if (this.canBeMoved) {

            this.pos.x += direction.x*(collisionDistance - dist)/divisor;
            this.pos.y += direction.y*(collisionDistance - dist)/divisor;

            this.enemyCollisionEvent(enemy, event);
        }

        if (enemy.canBeMoved) {

            enemy.pos.x -= direction.x*(collisionDistance - dist)/divisor;
            enemy.pos.x -= direction.y*(collisionDistance - dist)/divisor;

            enemy.enemyCollisionEvent(this, event);
        }
    }


    public draw(canvas : Canvas, assets : Assets | undefined, 
        bmp : Bitmap | undefined = undefined, shadowLayer : boolean = false) : void {
        
        if (!this.exist || !this.inCamera) {

            return;
        }

        let dw : number = this.sprite.width;
        let dh : number = this.sprite.height;
        let correctionShift : number = 0;

        if (this.bounceTimer > 0 && this.bounceAnimation) {

            if (this.bounceTimer > 0.5) {

                const t : number = 1.0 - (this.bounceTimer - 0.5)*2;
                const st : number = Math.sin(t*Math.PI);

                if (st > 0.5) {

                    correctionShift = -1;
                }

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
        const dy : number = this.pos.y - (dh - this.sprite.height/2) + 1 + correctionShift;

        this.sprite.draw(canvas, bmp, dx, dy, this.flip, dw, dh);

        if (this.bounceTimer > 0 && !shadowLayer) {

            this.drawStars(canvas, bmp);
        }
    }


    public doesCheckEnemyCollisions() : boolean {

        return this.checkEnemyCollisions;
    }
}