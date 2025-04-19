import { Assets, ProgramEvent, TransitionType } from "../core/interface.js";
import { Align, Bitmap, Canvas, Flip } from "../gfx/interface.js";


export type RestartEvent = (event : ProgramEvent) => void;


export class GameOver {


    private restartEvent : RestartEvent;
    private active : boolean = false;
    private appearTimer : number = 0.0;
    private mode : number = 0;

    private pressAnyKeyText : string = "";
    private anyKeyFlickerTimer : number = 0.0;


    constructor(restartEvent : RestartEvent, event : ProgramEvent) {

        this.restartEvent = restartEvent;

        this.pressAnyKeyText = event.localization?.getItem("anykey")?.[0] ?? "";
    }


    public update(event : ProgramEvent) : void {

        const APPEAR_SPEED : number = 1.0/45.0;
        const ANY_KEY_FLICKER_SPEED : number = 1.0/60.0;

        if (!this.active) {

            return;
        }

        switch (this.mode) {

        case 0:

            this.appearTimer += APPEAR_SPEED*event.tick;
            if (this.appearTimer >= 1.0) {

                this.mode = 1;
                this.appearTimer = 0.0;
            }
            break;

        case 1:

            this.anyKeyFlickerTimer = (this.anyKeyFlickerTimer + ANY_KEY_FLICKER_SPEED*event.tick) % 1.0;
            if (event.input.isAnyPressed()) {

                event.audio.playSample(event.assets.getSample("start"), 0.60);
                event.transition.activate(true, TransitionType.Circle, 1.0/20.0, (event : ProgramEvent) : void => {

                    this.restartEvent(event);
                    this.active = false;
                });
            }
            break;

        default:
            break;
        }
    }


    public draw(canvas : Canvas, assets : Assets) : void {

        const SHIFT_Y : number = -32;

        if (!this.active) {

            return;
        }

        const bmp : Bitmap | undefined = assets.getBitmap("gameover");
        if (bmp === undefined) {

            return;
        }

        const dx : number = canvas.width/2 - bmp.width/2;
        const dy : number = canvas.height/2 - bmp.height/2 + SHIFT_Y;

        canvas.setColor(0, 0, 0, 0.50);
        canvas.fillRect();

        canvas.setColor();
        
        if (this.mode == 0) {

            canvas.drawFunnilyAppearingBitmap(bmp, Flip.None, dx, dy, 0, 0, bmp.width, bmp.height, 
                1.0 - this.appearTimer, 32, 4, 4);
            return;
        }

        canvas.drawBitmap(bmp, Flip.None, dx, dy);

        if (this.anyKeyFlickerTimer > 0.5) {

            return;
        }
        const bmpFont : Bitmap | undefined = assets.getBitmap("font_outlines");
        canvas.drawText(bmpFont, this.pressAnyKeyText, canvas.width/2, canvas.height - 76, -8, 0, Align.Center);
    }


    public isActive() : boolean {

        return this.active;
    }


    public deactivate() : void {

        this.active = false;
    }


    public activate() : void {
        
        this.active = true;
        this.appearTimer = 0.0;
        this.mode = 0;
        this.anyKeyFlickerTimer = 0.0;
    }
}
