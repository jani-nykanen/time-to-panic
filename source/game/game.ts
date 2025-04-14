import { Vector } from "../common/vector.js";
import { Assets, ProgramEvent, Scene, SceneParameter } from "../core/interface.js";
import { Align, Bitmap, Canvas, Effect, Mesh, TransformTarget } from "../gfx/interface.js";
import { Camera } from "./camera.js";
import { ObjectManager } from "./objectmanager.js";
import { Stage } from "./stage.js";
import { Background } from "./background.js";
import { GameState } from "./gamestate.js";
import { HUD } from "./hud.js";


export class GameScene implements Scene {


    private objects : ObjectManager;
    private background : Background;
    private stage : Stage | undefined = undefined;
    private camera : Camera;
    private state : GameState;
    private hud : HUD;


    constructor(event : ProgramEvent)  {

        this.state = new GameState(1000, 10);
        this.objects = new ObjectManager(this.state);
        this.camera = new Camera(0, 0, event);
        this.background = new Background(1);
        this.hud = new HUD(this.state);
    }


    public init(param : SceneParameter, event : ProgramEvent) : void {

        this.stage = new Stage(
            event.assets.getTilemap("level1"),
            event.assets.getTilemap("collisions1"));
        this.objects.init(this.stage, event);
    }


    public update(event : ProgramEvent) : void {

        this.camera.update(event);
        this.stage?.update(event);
        this.objects.update(this.stage, this.camera, event);

        this.state.update(event);
        this.hud.update(event);
    }


    public redraw(canvas : Canvas, assets : Assets, isCloningToBuffer : boolean = false): void {
        
        canvas.moveTo();
        canvas.clear(0, 85, 170);

        this.background.draw(canvas, assets, this.camera);

        this.camera.apply(canvas);
        this.stage?.draw(canvas, assets, this.camera);
        this.objects.draw(canvas, assets);

        canvas.moveTo();
        this.hud.draw(canvas, assets);
    }


    public dispose() : SceneParameter {
        
        return undefined;
    }

}

