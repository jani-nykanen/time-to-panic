import { Vector } from "../common/vector.js";
import { Assets, InputState, ProgramEvent, Scene, SceneParameter, TransitionType } from "../core/interface.js";
import { Align, Bitmap, Canvas, Effect, Flip, Mesh, TransformTarget } from "../gfx/interface.js";
import { AnimatedSprite } from "../gfx/sprite.js";
import { TextBox } from "../ui/textbox.js";


export class StoryScene implements Scene {


    private text : TextBox;

    private spriteFinalboss : AnimatedSprite;
    private spritePlayer : AnimatedSprite;

    private playerPos : number = 0;
    private playerDir : number = 1;


    constructor(event : ProgramEvent)  {

        this.spriteFinalboss = new AnimatedSprite(64, 64);
        this.spritePlayer = new AnimatedSprite(24, 24);

        this.text = new TextBox();
    }


    private drawScenery(canvas : Canvas, assets : Assets) : void {

        const bmpFinalBoss : Bitmap | undefined = assets.getBitmap("final_boss");
        const bmpPlayer : Bitmap | undefined = assets.getBitmap("player");
        const bmpTileset1 : Bitmap | undefined = assets.getBitmap("tileset1");

        canvas.setColor(73, 73, 73);
        canvas.fillEllipse(canvas.width/2, 100, 240, 16);
        canvas.setColor();

        canvas.drawBitmap(bmpTileset1, Flip.None, canvas.width/4*3 - 40, 64, 64, 160, 48, 32);

        this.spriteFinalboss.draw(canvas, bmpFinalBoss, canvas.width/4*3 - 80, 36);

        const middle : number = canvas.width/4 + 32;
        this.spritePlayer.draw(canvas, bmpPlayer, middle + this.playerPos, 80, 
            this.playerDir < 0 ? Flip.Horizontal : Flip.None);
    }


    public init(param : SceneParameter, event : ProgramEvent) : void {

        this.text.addText(event.localization?.getItem("story") ?? []);
        this.text.activate(false, (event : ProgramEvent) : void => {

            event.transition.activate(true, TransitionType.Fade, 1.0/30.0,
                (event : ProgramEvent) : void => {

                    event.transition.activate(false, TransitionType.Circle, 1.0/30.0);
                    event.scenes.changeScene("game", event);
                }
            )
        });
    }


    public update(event : ProgramEvent) : void {

        const MAX_PLAYER_DISTANCE : number = 32;
        const PLAYER_SPEED : number = 1.5;

        this.spriteFinalboss.animate(0, 0, 3, 10, event.tick);
        this.spritePlayer.animate(0, 1, 4, 6, event.tick);

        this.playerPos += this.playerDir*PLAYER_SPEED*event.tick;
        if (this.playerDir > 0 && this.playerPos > MAX_PLAYER_DISTANCE) {

            this.playerPos = MAX_PLAYER_DISTANCE;
            this.playerDir = -1;
        }
        else if (this.playerDir < 0 && this.playerPos < -MAX_PLAYER_DISTANCE) {

            this.playerPos = -MAX_PLAYER_DISTANCE;
            this.playerDir = 1;
        }

        if (event.transition.isActive()) {

            return;
        }

        this.text.update(event);
    }


    public redraw(canvas : Canvas, assets : Assets, isCloningToBuffer : boolean = false): void {
        
        canvas.moveTo();
        canvas.clear(0, 0, 0);

        this.drawScenery(canvas, assets);
        this.text.draw(canvas, assets, 0, 48);
    }


    public dispose() : SceneParameter {
        
        return undefined;
    }

}

