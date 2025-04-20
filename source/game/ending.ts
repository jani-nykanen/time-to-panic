import { Vector } from "../common/vector.js";
import { Assets, InputState, ProgramEvent, Scene, SceneParameter, TransitionType } from "../core/interface.js";
import { Align, Bitmap, Canvas, Effect, Flip, Mesh, TransformTarget } from "../gfx/interface.js";
import { AnimatedSprite } from "../gfx/sprite.js";
import { TextBox } from "../ui/textbox.js";


export class EndingScene implements Scene {


    private text : TextBox;

    private phase : number = 0;
    private endTextWave : number = 0.0;


    constructor(event : ProgramEvent)  {

        this.text = new TextBox();
    }


    private prepareTextbox(event : ProgramEvent) : void {

        this.text.addText(event.localization?.getItem("ending") ?? []);
        this.text.activate(false, (event : ProgramEvent) : void => {

            this.phase = 1;
            event.transition.activate(false, TransitionType.Fade, 1.0/30.0);
        });
    }


    public init(param : SceneParameter, event : ProgramEvent) : void {

        this.prepareTextbox(event);
    }


    public update(event : ProgramEvent) : void {

        const END_TEXT_WAVE_SPEED : number = Math.PI*2/180.0;

        this.endTextWave = (this.endTextWave + END_TEXT_WAVE_SPEED*event.tick) % (Math.PI*2);

        if (event.transition.isActive()) {

            return;
        }

        if (this.phase == 1) {

            if (event.input.isAnyPressed()) {

                event.audio.playSample(event.assets.getSample("choose"), 0.60);
                event.transition.activate(true, TransitionType.Fade,
                    1.0/30.0,
                    (event : ProgramEvent) : void => {

                        event.scenes.changeScene("titlescreen", event);
                    });
            }
            return;
        }

        this.text.update(event);
    }


    public redraw(canvas : Canvas, assets : Assets, isCloningToBuffer : boolean = false): void {
        
        canvas.moveTo();
        canvas.clear(0, 0, 0);

        if (this.phase == 1) {

            const bmpEnd : Bitmap | undefined = assets.getBitmap("the_end");
            if (bmpEnd === undefined) {

                return;
            }

            canvas.drawVerticallyWavingBitmap(bmpEnd,  
                canvas.width/2 - bmpEnd.width/2,
                canvas.height/2 - bmpEnd.height/2,
                0, 0, bmpEnd.width, bmpEnd.height, 
                Math.PI*2, 6, this.endTextWave);
            return;
        }

        this.text.draw(canvas, assets, 0, 0, -4, false);
    }


    public dispose() : SceneParameter {
        
        return undefined;
    }

}

