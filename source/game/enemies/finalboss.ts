import { Rectangle } from "../../common/rectangle.js";
import { RGBA } from "../../common/rgba.js";
import { Vector } from "../../common/vector.js";
import { Assets, ProgramEvent, TransitionType } from "../../core/interface.js";
import { Bitmap, Canvas, Flip } from "../../gfx/interface.js";
import { Camera } from "../camera.js";
import { Player } from "../player.js";
import { Enemy } from "./enemy.js";


const GRAVITY : number = 6.0;


export class FinalBoss extends Enemy {


    private falling : boolean = false;


    constructor(x : number, y : number) {

        super(x, y);

        this.sprite.resize(64, 64);

        this.speedTarget.y = GRAVITY;

        this.sprite.setFrame(0, 0);

        this.collisionBox = new Rectangle(0, 4, 4, 12);
        this.hitbox = new Rectangle(0, -8, 32, 76);

        this.friction.y = 0.15;
    
        this.cameraCheckArea = new Vector(80, 128);
    }


    protected bounceEvent(event : ProgramEvent, initial : boolean = false) : void {
        
        if (!this.falling && initial) {

            this.falling = true;
            this.canBeBounced = false;
            this.harmful = false;
            this.takeCollisions = false;

            this.flip |= Flip.Vertical;
        }
    }


    protected playerEvent(player : Player, event : ProgramEvent) : void {
        
        if (this.falling || this.bounceTimer > 0) {

            return;
        }

        this.flip = Flip.None;
        if (player.getPosition().x > this.pos.x) {

            this.flip = Flip.Horizontal;
        }
    }


    protected updateAI(event : ProgramEvent, camera? : Camera) : void {
        
        if (this.falling) {

            if (this.pos.y > (camera?.height ?? event.screenHeight) + this.sprite.height - 8) {

                camera?.shake(8, 30);

                event.audio.playSample(event.assets.getSample("burning_alive"), 0.60);
                event.audio.stopMusic();
                event.transition.activate(true, TransitionType.Fade, 1.0/60.0, (event : ProgramEvent) => {

                    event.scenes.changeScene("ending", event);
                }, new RGBA(255, 255, 255));
            }
            return;
        }

        this.sprite.animate(0, 0, 3, 12, event.tick);
    }


    public draw(canvas : Canvas, assets : Assets | undefined, _ : Bitmap | undefined, shadowLayer : boolean = false) : void {
        
        if (!this.exist || !this.inCamera) {

            return;
        }

        const bmp : Bitmap | undefined = assets?.getBitmap("final_boss");
        
        const dx : number = this.pos.x - 32;
        const dy : number = this.pos.y - 56 + 1;

        this.sprite.draw(canvas, bmp, dx, dy, this.flip);

        if (this.bounceTimer > 0 && !shadowLayer) {

            const bmpEnemies : Bitmap | undefined = assets?.getBitmap("enemies");
            this.drawStars(canvas, bmpEnemies);
        }
    }
}