import { Vector } from "../common/vector.js";
import { Assets, InputState, ProgramEvent } from "../core/interface.js";
import { Canvas, Bitmap, Flip } from "../gfx/interface.js";
import { CollisionObject } from "./collisionobject.js";
import { AnimatedSprite } from "../gfx/sprite.js";
import { Camera } from "./camera.js";
import { ObjectGenerator } from "./objectgenerator.js";
import { DustParticle } from "./dustparticle.js";
import { Rectangle } from "../common/rectangle.js";



export class Player extends CollisionObject {


    private sprite : AnimatedSprite;

    private dustGenerator : ObjectGenerator<DustParticle>;
    private dustTimer : number = 0;

    private touchGround : boolean = false;
    private ledgeTimer : number = 0;
    private jumpTimer : number = 0;


    constructor(x : number, y : number) {

        super(x, y, true);

        this.friction.x = 0.15;
        this.friction.y = 0.15;

        this.sprite = new AnimatedSprite(16, 16);

        this.dustGenerator = new ObjectGenerator<DustParticle> (DustParticle);

        this.collisionBox = new Rectangle(0, 2, 8, 12);
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

        const BASE_SPEED : number = 1.0;
        const BASE_GRAVITY : number = 4.0;

        const stick : Vector = event.input.stick;

        this.speedTarget.x = stick.x*BASE_SPEED;
        this.speedTarget.y = BASE_GRAVITY;
    }


    private control(event : ProgramEvent) : void {

        this.controlBaseMovement(event);
        this.controlJumping(event);
    }


    private updateJumping(event : ProgramEvent) : void {

        const JUMP_SPEED_BASE : number = -2.5;

        if (this.jumpTimer > 0) {

            this.jumpTimer -= event.tick;
            this.speed.y = JUMP_SPEED_BASE;
        }
    }


    private animate(event : ProgramEvent) : void {

        // ...
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
        this.updateDust(camera, event);

        this.updateFlags();
    }


    protected verticalCollisionEvent(dir : -1 | 1, event : ProgramEvent) : void {

        const LEDGE_TIME : number = 8.0;

        if (dir == 1) {

            this.touchGround = true;
            this.ledgeTimer = LEDGE_TIME;
        }
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

        // const bmpPlayer : Bitmap | undefined = assets.getBitmap("player");

        const dx : number = this.pos.x - 8;
        const dy : number = this.pos.y - 8 + 1;

        // this.sprite.draw(canvas, bmpPlayer, dx, dy);

        canvas.setColorF(1.0, 0.0, 0.0);
        canvas.fillRect(dx, dy, 16, 16);
        canvas.setColor();
    }
}