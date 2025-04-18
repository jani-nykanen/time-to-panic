import { Canvas } from "../../gfx/interface.js";
import { SceneManager, ProgramEvent, Assets, Scene, SceneParameter } from "../interface.js";


export class BaseSceneManager implements SceneManager {


    private scenes : Map<string, Scene>;
    private activeScene : Scene | undefined = undefined;


    constructor() {

        this.scenes = new Map<string, Scene> ();
    }


    public addScene(name : string, scene : Scene, makeActive : boolean = true) : void {

        this.scenes.set(name, scene);
        if (makeActive) {

            this.activeScene = scene;
        }
        
    }

    public init(event : ProgramEvent) : void {

        this.activeScene?.init?.(undefined, event);
    }


    public update(event : ProgramEvent) : void {

        this.activeScene?.update(event);
    }

    
    public redraw(canvas : Canvas, assets : Assets, isCloningToBuffer : boolean = false) : void {

        this.activeScene?.redraw(canvas, assets, isCloningToBuffer);
    }


    public postDraw(canvas : Canvas, assets : Assets) : void {

        this.activeScene?.postDraw?.(canvas, assets);
    }


    public changeScene(name : string, event : ProgramEvent) : void {

        const param : SceneParameter = this.activeScene?.dispose();

        this.activeScene = this.scenes.get(name);
        if (this.activeScene === undefined) {

            throw new Error(`Could not find a scene with the name ${name}!`);
        }
        this.activeScene.init?.(param, event)
    }
}
