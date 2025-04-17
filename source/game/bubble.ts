import { Vector } from "../common/vector.js";
import { Assets, ProgramEvent } from "../core/interface.js";
import { Canvas, Bitmap, Flip } from "../gfx/interface.js";
import { SpecialCollider } from "./specialcollider.js";
import { AnimatedSprite } from "../gfx/sprite.js";
import { Camera } from "./camera.js";
import { Rectangle } from "../common/rectangle.js";
import { Player } from "./player.js";
import { Direction } from "./direction.js";
import { clamp } from "../common/mathutil.js";


const INACTIVITY_TIME : number = 180;


export class Bubble extends SpecialCollider {


    private inactive : boolean = false;
    private inactivityTimer : number = 0;
    private bursting : boolean = false;
    private reappearing : boolean = false;

    private sprite : AnimatedSprite;

    private wave : number = 0.0;

    private initialY : number;


    constructor(x : number, y : number) {

        super(x, y);

        this.initialY = y;

        this.sprite = new AnimatedSprite(32, 32);
        this.sprite.setFrame(0, 3);

        this.wave = ((x/16) | 0) % 2 == ((y/16) | 0) % 2 ? Math.PI : 0;
    }


    public playerCollision(player : Player, camera : Camera, event : ProgramEvent) : void {
        
        const LAUNCH_SPEED_X : number = 3.0;
        const LAUNCH_SPEED_Y : number = 4.0;

        const TRIGGER_DISTANCE : number = 12 + 6;

        // Now this is misleading...
        if (!this.isActive() || this.inactive) {

            return;
        }
        
        if (this.distanceTo(player) <= TRIGGER_DISTANCE) {

            this.inactive = true;
            this.bursting = true;
            this.inactivityTimer = INACTIVITY_TIME;

            const dir : Vector = this.directionTo(player);
            player.launch(dir.x*LAUNCH_SPEED_X, dir.y*LAUNCH_SPEED_Y, true, true);

            this.sprite.setFrame(1, 3);
        }
    }


    protected updateEvent(camera : Camera, event : ProgramEvent) : void {
        
        const WAVE_SPEED : number = Math.PI*2/180.0;
        const AMPLITUDE : number = 4.0;

        if (this.inactive) {

            if (this.reappearing) {

                this.sprite.animate(4, 0, 3, 6, event.tick);
                if (this.sprite.column == 3) {

                    this.sprite.setFrame(0, 3);
                    this.inactive = false;
                    this.reappearing = false;
                }
                return;
            }

            if (this.bursting) {

                this.sprite.animate(3, 1, 4, 6, event.tick);
                if (this.sprite.column == 4) {

                    this.bursting = false;
                    this.sprite.setFrame(0, 4);
                }
            }

            this.inactivityTimer -= event.tick;
            if (this.inactivityTimer <= 0) {

                this.reappearing = true;
                this.sprite.setFrame(0, 4);
            }
            return;
        }

        this.wave = (this.wave + WAVE_SPEED*event.tick) % (Math.PI*2);
        this.pos.y = this.initialY + Math.sin(this.wave)*AMPLITUDE;
    }


    public draw(canvas : Canvas, assets : Assets | undefined, bmp : Bitmap | undefined) : void {
        
        if (!this.isActive()) {

            return;
        }

        const dx : number = this.pos.x - 16;
        const dy : number = this.pos.y - 16;

        if (this.inactive && !this.bursting && !this.reappearing) {

            return;
        }

        this.sprite.draw(canvas, bmp, dx, dy);
    }
}


