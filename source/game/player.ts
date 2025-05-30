import { Vector } from "../common/vector.js";
import { Assets, InputState, ProgramEvent } from "../core/interface.js";
import { Canvas, Bitmap, Flip } from "../gfx/interface.js";
import { CollisionObject } from "./collisionobject.js";
import { AnimatedSprite } from "../gfx/sprite.js";
import { Camera } from "./camera.js";
import { ObjectGenerator } from "./objectgenerator.js";
import { DustParticle } from "./dustparticle.js";
import { Rectangle } from "../common/rectangle.js";
import { GameState } from "./gamestate.js";
import { Stage } from "./stage.js";
import { FlyingText } from "./flyingtext.js";
import { RGBA } from "../common/rgba.js";
import { GameObject } from "./gameobject.js";
import { clamp } from "../common/mathutil.js";


const RUN_TARGET_SPEED : number = 2.0;
const BASE_GRAVITY : number = 4.0;

const MONEY_COLORS : RGBA[] = [
    new RGBA(255, 219, 109),
    new RGBA(219, 182, 255)
];


export class Player extends CollisionObject {


    private sprite : AnimatedSprite;
    private flip : Flip = Flip.None;
    private direction : number = 1;

    private dustGenerator : ObjectGenerator<DustParticle>;
    private flyingText : ObjectGenerator<FlyingText>;
    private dustTimer : number = 0;

    private touchGround : boolean = true;
    private ledgeTimer : number = 0;
    private jumpTimer : number = 0;
    private doubleJumping : boolean = false;
    private canDoubleJump : boolean = false;

    private respawnPoint : Vector;
    private respawnPointFound : boolean = true;

    private respawning : boolean = false;
    private deathTimer : number = 0.0;
    private noMoneyDeath : boolean = false;

    public readonly state : GameState;


    constructor(x : number, y : number, state : GameState, flyingText : ObjectGenerator<FlyingText>) {

        super(x, y, true);

        this.respawnPoint = this.pos.clone();

        this.friction.x = 0.15;
        this.friction.y = 0.15;

        this.sprite = new AnimatedSprite(24, 24);

        this.dustGenerator = new ObjectGenerator<DustParticle> (DustParticle);
        this.flyingText = flyingText;

        this.collisionBox = new Rectangle(0, 1, 8, 14);

        this.inCamera = true;
        this.cameraCheckArea = new Vector(256, 256);

        this.hitbox = new Rectangle(0, 0, 12, 16);

        this.state = state;
    }


    private controlJumping(event : ProgramEvent) : void {

        const JUMP_TIME_BASE : number = 12.0;
        const DOUBLE_JUMP_TIME : number = 8.0;
        const JUMP_VOL : number = 0.60;

        const jumpButton : InputState = event.input.getAction("jump");
        if (jumpButton == InputState.Pressed) {

            if (this.ledgeTimer > 0) {

                this.jumpTimer = JUMP_TIME_BASE;
                this.touchGround = false;
                this.ledgeTimer = 0;

                event.audio.playSample(event.assets.getSample("jump"), JUMP_VOL);
            }
            else if (this.canDoubleJump) {

                this.jumpTimer = DOUBLE_JUMP_TIME;
                this.canDoubleJump = false;
                this.doubleJumping = true;

                event.audio.playSample(event.assets.getSample("jump"), JUMP_VOL);
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

        const t : number = clamp(Math.abs(this.speed.x/2.0), 0, 1);
        this.friction.x = BASE_FRICTION*(1.0 - Math.sqrt(t)*0.90);
    }


    private determineBounceFactor() : void {

        const THRESHOLD : number = 1.0;
        const BASE_FACTOR = 0.90;

        if (Math.abs(this.speed.x) < THRESHOLD) {

            this.bounceFactor.x = 0.0;
            return;
        }

        this.bounceFactor.x = clamp((Math.abs(this.speed.x) - THRESHOLD)*BASE_FACTOR, 0, 1.0);
    }


    private updateJumping(event : ProgramEvent) : void {

        const JUMP_SPEED_BASE : number = -2.5;

        if (this.jumpTimer > 0) {

            this.jumpTimer -= event.tick;
            this.speed.y = JUMP_SPEED_BASE;
        }
    }


    private updateTimers(event : ProgramEvent) : void {

        if (this.ledgeTimer > 0) {

            this.ledgeTimer -= event.tick;
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
        const SPIN_MAX_SPEED : number = 0.0;

        if (this.doubleJumping) {

            this.sprite.animate(2, 0, 7, 2, event.tick);

            if (this.sprite.column == 0 && 
                this.jumpTimer <= 0 &&
                this.speed.y >= SPIN_MAX_SPEED) {

                this.doubleJumping = false;
            }
            return;
        }

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

        const DUST_TIME : number = 8.0;

        this.dustGenerator.update(camera, event);
        if (!this.doubleJumping && (!this.touchGround || Math.abs(this.speedTarget.x) <= 0.01)) {

            return;
        }

        const dustSpeed : number = this.doubleJumping ? 2 : 1;
        const xoff : number = this.doubleJumping ? 0 : -4;
        const yoff : number = 8;

        this.dustTimer += dustSpeed*event.tick;
        if (this.dustTimer >= DUST_TIME) {

            this.dustTimer -= DUST_TIME;

            const o : DustParticle = this.dustGenerator.next();
            o.spawn(this.pos.x + xoff,
                this.pos.y + yoff,
                0.0, 0.0,
                this.doubleJumping ? 1 : 0);
            o.setReferenceObject(this.referenceObject);
        }
    }


    private updateFlags() : void {

        this.touchGround = false;
    }


    private initiateRespawn(event : ProgramEvent) : void {

        this.pos.makeEqual(this.respawnPoint);
        this.oldPos.makeEqual(this.pos);

        this.speedTarget.zero();
        this.speed.zero();
        this.flip = Flip.None;
        this.sprite.setFrame(3, 1);

        this.jumpTimer = 0;
        this.touchGround = true;
        this.canDoubleJump = true;

        this.respawning = true;
        this.dying = false;
        this.exist = true;
    }


    private respawn(event : ProgramEvent) : void {

        this.sprite.animate(1, 3, 7, 5, event.tick);
        if (this.sprite.column == 7) {

            this.sprite.setFrame(0, 0);
            this.respawning = false;
        }
    }


    private drawDeath(canvas : Canvas, bmp : Bitmap | undefined) : void {

        const ORB_COUNT : number = 8;
        const ORB_DISTANCE : number = 48;

        const t : number = this.deathTimer;
        const step : number = Math.PI*2 / ORB_COUNT;

        const dx : number = Math.round(this.pos.x);
        const dy : number = Math.round(this.pos.y);

        if (t > 0.5) {

            canvas.setAlpha(1.0 - (t - 0.5)*2.0);
        }

        for (let i : number = 0; i < ORB_COUNT; ++ i) {

            const angle : number = step*i;

            this.sprite.draw(canvas, bmp,
                dx + Math.round(Math.cos(angle)*t*ORB_DISTANCE) - 12,
                dy + Math.round(Math.sin(angle)*t*ORB_DISTANCE) - 12);
        }

        canvas.setAlpha();
    }


    protected updateEvent(camera : Camera, event : ProgramEvent) : void {
        
        if (this.respawning) {

            this.respawn(event);
            return;
        }

        this.control(event);
        this.animate(event);
        this.updateJumping(event);
        this.determineFriction();
        this.determineBounceFactor();
        this.updateDust(camera, event);
        this.updateTimers(event);

        this.updateFlags();
    }


    protected cameraEvent(enteredCamera : boolean, camera : Camera, event : ProgramEvent) : void {
        
        if (camera.isMoving()) {

            return;
        }

        const camPos : Vector = camera.position;

        this.horizontalCollision(camPos.x, -1024, camera.height + 2048, -1, event);
        
        if (this.horizontalCollision(camPos.x + camera.width, -1024, camera.height + 2048, 1, event)) {

            camera.move(1, 0);
            this.speed.zero();
            this.speedTarget.zero();

            this.respawnPointFound = false;
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
            this.canDoubleJump = true;
            this.doubleJumping = false;
            return;
        }

        this.jumpTimer = 0.0;
    }


    protected die(event: ProgramEvent, camera : Camera | undefined) : boolean {
        
        const DEATH_SPEED : number = 1.0/30.0;

        if (camera != undefined) {

            if (!camera.isShaking()) {

                camera.shake(4, 1.0/DEATH_SPEED + 1);
            }
            this.dustGenerator.update(camera, event);
        }

        this.sprite.animate(0, 5, 8, 3, event.tick);

        this.deathTimer += DEATH_SPEED*event.tick;
        if (this.deathTimer >= 1.0) {

            // No money -> death
            if (this.noMoneyDeath) {

                return true;
            }

            this.initiateRespawn(event);
        }
        // Never return true
        return false;
    }


    public hurtCollision(x : number, y : number, w : number, h : number, event : ProgramEvent) : void {
        
        if (!this.isActive() || this.respawning) {

            return;
        }

        if (this.overlayCollisionArea(x - 1, y - 1, w + 2, h + 2)) {

            this.makeDie(event);
        }
    }


    public preDraw(canvas: Canvas, assets : Assets) : void {

        if (!this.exist) {

            return;
        }

        const bmpDust : Bitmap | undefined = assets.getBitmap("dust");

        // canvas.beginSpriteBatching(bmpDust);
        this.dustGenerator.draw(canvas, assets, bmpDust);
        // canvas.endSpriteBatching();
        // canvas.drawSpriteBatch();
    }


    public draw(canvas: Canvas, assets : Assets,
        bmp : Bitmap | undefined = undefined, shadowLayer : boolean = false) : void {
        
        if (!this.exist) {

            return;
        }

        const bmpPlayer : Bitmap | undefined = assets.getBitmap("player");
        if (this.dying) {

            if (shadowLayer) {

                return;
            }

            this.drawDeath(canvas, bmpPlayer);
            return;
        }

        const dx : number = this.pos.x - 12;
        const dy : number = this.pos.y - 12 + 1;

        this.sprite.draw(canvas, bmpPlayer, dx, dy, this.flip);
    }


    public stageEvent(camera : Camera, stage : Stage | undefined, event : ProgramEvent) : void {

        if (stage === undefined) {

            return;
        }

        if (!camera.isMoving() && !this.respawnPointFound) {

            const p : Vector = stage.findRespawnPoint(camera);

            this.respawnPoint.x = p.x*16 + 12;
            this.respawnPoint.y = p.y*16 - 8;

            this.respawnPointFound = true;
        }
    }


    public earnMoney(amount : number, colorID : number, event : ProgramEvent) : void {

        this.state.addMoney(amount);

        this.flyingText.next().spawn(
            this.pos.x, this.pos.y - 12, amount, MONEY_COLORS[colorID] ?? MONEY_COLORS[0]);
    }
    
    
    public makeDie(event : ProgramEvent) : void {

        const DEATH_PENALTY : number = 10;

        this.dying = true;
        this.deathTimer = 0.0;

        this.noMoneyDeath = this.state.moneyTarget <= 0;

        this.state.addMoney(-DEATH_PENALTY);
        this.flyingText.next().spawn(
            this.pos.x, this.pos.y - 12, -DEATH_PENALTY, new RGBA(255, 73, 0));

        event.audio.playSample(event.assets.getSample("die"), 0.60);
    }


    public makeJump(speed : number, event : ProgramEvent) : void {

        this.speed.y = -speed;
        this.canDoubleJump = true;
        this.doubleJumping = false;

        this.jumpTimer = 0;
    }


    public launch(speedx : number, speedy : number, 
        stopJump : boolean = false, enableDoubleJump : boolean = false) : void {

        this.speed.x = speedx;
        this.speed.y = speedy;

        if (stopJump) {

            this.jumpTimer = 0;
        }

        if (enableDoubleJump) {

            this.canDoubleJump = true;
        this.doubleJumping = false;
        }
    }
}
