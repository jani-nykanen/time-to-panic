import { Assets, ProgramEvent } from "../core/interface.js";
import { Bitmap, Canvas } from "../gfx/interface.js";
import { Camera } from "./camera.js";
import { ObjectGenerator } from "./objectgenerator.js";
import { Player } from "./player.js";
import { Stage } from "./stage.js";


export class ObjectManager {


    private player : Player | undefined = undefined;


    constructor() {
        
        // ...
    }


    public init(stage : Stage | undefined, event : ProgramEvent) : void {

        this.player = new Player(64, event.screenHeight/2);
    }


    public update(stage : Stage | undefined, camera : Camera, event : ProgramEvent) : void {

        this.player?.update(camera, event);
        stage?.objectCollision(this.player, camera, event);
    }


    public draw(canvas : Canvas, assets : Assets) : void {

        this.player?.draw(canvas, assets);
    }
}
