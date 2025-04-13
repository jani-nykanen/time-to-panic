import { Vector } from "../common/vector.js";
import { Assets, InputState, ProgramEvent } from "../core/interface.js";
import { Canvas, Bitmap, Flip } from "../gfx/interface.js";
import { CollisionObject } from "./collisionobject.js";
import { AnimatedSprite } from "../gfx/sprite.js";
import { Camera } from "./camera.js";
import { ObjectGenerator } from "./objectgenerator.js";
import { DustParticle } from "./dustparticle.js";
import { Rectangle } from "../common/rectangle.js";


const RUN_TARGET_SPEED : number = 2.0;
const BASE_GRAVITY : number = 4.0;


export class Player extends CollisionObject {


    private sprite : AnimatedSprite;
    private flip : Flip = Flip.None;
    private direction : number = 1;

    private dustGenerator : ObjectGenerator<DustParticle>;
    private dustTimer : number = 0;

    private touchGround : boolean = false;
    private ledgeTimer : number = 0;
    private jumpTimer : number = 0;


    constructor(x : number, y : number) {

        super(x, y, true);

        this.friction.x = 0.15;
        this.friction.y = 0.15;

        this.sprite = new AnimatedSprite(24, 24);

        this.dustGenerator = new ObjectGenerator<DustParticle> (DustParticle);

        this.collisionBox = new Rectangle(0, 1, 6, 14);

        this.inCamera = true;
        this.cameraCheckArea = new Vector(256, 256);
    }


    private controlJumping(event : ProgramEvent) : void {

        const JUMP_TIME_BASE : number = 12.0;

        const jumpButton : InputState = event.input.getAction("jump");
        if (jumpButton == InputState.Pressed) {

            if (this.ledgeTimer > 0) {

                this.jumpTimer = JUMP_TIME_BASE;
                this.touchGround = false;
                this.ledgeTimer = 0;
            }
        }
        else if (jumpButton == InputState.Released) {

            this.jumpTimer = 0.0;
        }
    }


    private controlBaseMovement(event : ProgramEvent) : void {

        const stick : Vector = event.input.stick;
        if (Math.abs(stick.x) > 0.01) {

            this.direction = Math.sign(stick.x);
            this.flip = this.direction == 1 ? Flip.None : Flip.Horizontal;
        }

        this.speedTarget.x = stick.x*RUN_TARGET_SPEED;
        this.speedTarget.y = BASE_GRAVITY;
    }


    private control(event : ProgramEvent) : void {

        this.controlBaseMovement(event);
        this.controlJumping(event);
    }


    private determineFriction() : void {

        const BASE_FRICTION : number = 0.10;
        const AIR_FRICTION : number = 0.05;

        if (!this.touchGround) {

            this.friction.x = AIR_FRICTION;
            return;
        }

        if (this.direction != Math.sign(this.speed.x) ||
            Math.abs(this.speedTarget.x) < 0.01) {

            this.friction.x = BASE_FRICTION;
            return;
        }

        const t : number = Math.abs(this.speed.x/2.0);
        this.friction.x = BASE_FRICTION*(1.0 - Math.sqrt(t)*0.90);
    }


    private determineBounceFactor() : void {

        const THRESHOLD : number = 1.0;
        const BASE_FACTOR = 0.90;

        if (Math.abs(this.speed.x) < THRESHOLD) {

            this.bounceFactor.x = 0.0;
            return;
        }

        this.bounceFactor.x = (Math.abs(this.speed.x) - 1.0)*BASE_FACTOR;
    }


    private updateJumping(event : ProgramEvent) : void {

        const JUMP_SPEED_BASE : number = -2.5;

        if (this.jumpTimer > 0) {

            this.jumpTimer -= event.tick;
            this.speed.y = JUMP_SPEED_BASE;
        }
    }


    private animateRunning(event : ProgramEvent) : void {

        if (Math.abs(this.speedTarget.x) < 0.01 && Math.abs(this.speed.x) < 0.01) {

            this.sprite.setFrame(0, 0);
            return;
        }

        const speed : number = 12 - 4*Math.abs(this.speed.x);
        this.sprite.animate(0, 1, 4, speed, event.tick);
    }


    private animateJumping(event : ProgramEvent) : void {

        const THRESHOLD : number = 0.50;

        let frame : number = 1;
        if (this.speed.y < -THRESHOLD) {

            frame = 0;
        }
        else if (this.speed.y > THRESHOLD) {

            frame = 2;
        }

        this.sprite.setFrame(frame, 1);
    }


    private animate(event : ProgramEvent) : void {

        if (this.touchGround) {

            this.animateRunning(event);
            return;
        }
        this.animateJumping(event);
    }


    private updateDust(camera : Camera, event : ProgramEvent) : void {

        const X_OFFSET : number = -4;
        const Y_OFFSET : number = 7;
        const SPEED_X : number = -2.0;
        const SPEED_Y : number = 1.0;

        const DUST_TIME : number = 8.0;

        this.dustGenerator.update(camera, event);
        if (!this.touchGround) {

            return;
        }

        this.dustTimer += event.tick;
        if (this.dustTimer >= DUST_TIME) {

            this.dustTimer -= DUST_TIME;

            this.dustGenerator.next().spawn(
                this.pos.x + X_OFFSET,
                this.pos.y + Y_OFFSET,
                SPEED_X, SPEED_Y);
        }
    }


    private updateFlags() : void {

        this.touchGround = false;
    }


    protected updateEvent(camera : Camera, event : ProgramEvent) : void {
        
        this.control(event);
        this.animate(event);
        this.updateJumping(event);
        this.determineFriction();
        this.determineBounceFactor();
        this.updateDust(camera, event);

        this.updateFlags();
    }


    protected cameraEvent(enteredCamera : boolean, camera : Camera, event : ProgramEvent) : void {
        
        if (camera.isMoving()) {

            return;
        }

        const camPos : Vector = camera.position;

        this.horizontalCollision(camPos.x, 0, camera.height, -1, event);
        
        if (this.horizontalCollision(camPos.x + camera.width, 0, camera.height, 1, event)) {

            camera.move(1, 0);
            this.speed.zero();
            this.speedTarget.zero();
        }
    }


    protected cameraMovementEvent(camera : Camera, event : ProgramEvent) : void {
        
        this.pos.x += camera.getMoveSpeed()*16*event.tick;
    }


    protected verticalCollisionEvent(dir : -1 | 1, event : ProgramEvent) : void {

        const LEDGE_TIME : number = 8.0;

        if (dir == 1) {

            this.touchGround = true;
            this.ledgeTimer = LEDGE_TIME;
            return;
        }

        this.jumpTimer = 0.0;
    }


    public preDraw(canvas: Canvas, assets : Assets) : void {

        if (!this.exist) {

            return;
        }

        const bmpPlayer : Bitmap | undefined = assets.getBitmap("player");

        // Dust
        this.dustGenerator.draw(canvas, assets, bmpPlayer);
    }


    public draw(canvas: Canvas, assets : Assets) : void {
        
        if (!this.exist) {

            return;
        }

        const bmpPlayer : Bitmap | undefined = assets.getBitmap("player");

        const dx : number = this.pos.x - 12;
        const dy : number = this.pos.y - 12 + 1;

        this.sprite.draw(canvas, bmpPlayer, dx, dy, this.flip);
    }
}