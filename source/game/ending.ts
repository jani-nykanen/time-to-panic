import { Vector } from "../common/vector.js";
import { Assets, InputState, ProgramEvent, Scene, SceneParameter, TransitionType } from "../core/interface.js";
import { Align, Bitmap, Canvas, Effect, Flip, Mesh, TransformTarget } from "../gfx/interface.js";
import { AnimatedSprite } from "../gfx/sprite.js";
import { TextBox } from "../ui/textbox.js";


export class EndingScene implements Scene {


    private text : TextBox;


    constructor(event : ProgramEvent)  {

        this.text = new TextBox(true, 35, 6);
    
        this.text.addText(event.localization?.getItem("ending") ?? []);
        this.text.activate(false, (event : ProgramEvent) : void => {

            // ...?
        });
    }

    public init(param : SceneParameter, event : ProgramEvent) : void {

        // ...
    }


    public update(event : ProgramEvent) : void {

        if (event.transition.isActive()) {

            return;
        }
        this.text.update(event);
    }


    public redraw(canvas : Canvas, assets : Assets, isCloningToBuffer : boolean = false): void {
        
        canvas.moveTo();
        canvas.clear(0, 0, 0);

        this.text.draw(canvas, assets, 0, 48);
    }


    public dispose() : SceneParameter {
        
        return undefined;
    }

}

