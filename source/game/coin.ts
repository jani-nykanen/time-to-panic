import { Vector } from "../common/vector.js";
import { Assets, InputState, ProgramEvent } from "../core/interface.js";
import { Canvas, Bitmap, Flip } from "../gfx/interface.js";
import { CollisionObject } from "./collisionobject.js";
import { AnimatedSprite } from "../gfx/sprite.js";
import { Camera } from "./camera.js";
import { ObjectGenerator } from "./objectgenerator.js";
import { DustParticle } from "./dustparticle.js";
import { Rectangle } from "../common/rectangle.js";
import { GameObject } from "./gameobject.js";
import { Player } from "./player.js";


const MONEY_BONUS : number[] = [50, 200];


export class Coin extends GameObject {


    private initialPos : Vector;

    private sprite : AnimatedSprite;
    private wave : number = 0;

    private type : number = 0;


    constructor(x : number, y : number, type : number = 0) {

        super(x, y, true);

        this.initialPos = this.pos.clone();

        this.type = type;
        this.sprite = new AnimatedSprite(24, 24);

        this.inCamera = true;

        this.hitbox = new Rectangle(0, 0, 16, 16);

        const even : boolean = ((x/16) | 0) % 2 == ((y/16) | 0) % 2;
        if (!even) {

            this.wave += Math.PI;
            this.sprite.setFrame(2, type);
        }
    }


    protected die(event : ProgramEvent) : boolean {
        
        this.sprite.animate(this.type, 4, 8, 4, event.tick);
        return this.sprite.column >= 8;
    }


    protected updateEvent(camera : Camera, event : ProgramEvent) : void {
        
        const WAVE_SPEED : number = Math.PI*2/120.0;
        const AMPLITUDE : number = 3;

        this.sprite.animate(this.type, 0, 3, 8, event.tick);

        this.wave = (this.wave + WAVE_SPEED*event.tick) % (Math.PI*2);

        this.pos.y = this.initialPos.y + Math.sin(this.wave)*AMPLITUDE;
    }


    public playerCollision(player : Player, event : ProgramEvent) : void {

        if (!this.isActive()) {

            return;
        }

        if (player.overlayObject(this)) {

            this.dying = true;
            this.sprite.setFrame(4, this.type, false);

            player.earnMoney(MONEY_BONUS[this.type] ?? 0, this.type, event);
        }
    } 
    

    public draw(canvas : Canvas, assets : Assets | undefined, bmp : Bitmap | undefined) : void {
        
        if (!this.exist) {

            return;
        }

        const dx : number = this.pos.x - 12;
        const dy : number = this.pos.y - 12;

        this.sprite.draw(canvas, bmp, dx, dy, Flip.None);
    }
}
