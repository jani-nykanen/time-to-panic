import { Vector } from "../common/vector.js";
import { ProgramEvent} from "../core/interface.js";
import { Canvas } from "../gfx/interface.js";


export class Camera {
    

    private pos : Vector;

    private viewWidth : number;
    private viewHeight : number;


    public get width() : number {

        return this.viewWidth;
    }
    public get height() : number {

        return this.viewHeight;
    }
    public get position() : Vector {

        return this.pos.clone();
    }

    constructor(x : number = 0, y : number = 0, event : ProgramEvent) {

        this.pos = new Vector(x, y);

        this.viewWidth = event.screenWidth;
        this.viewHeight = event.screenHeight;
    }


    public update(event : ProgramEvent) : void {

        this.viewWidth = event.screenWidth;
        this.viewHeight = event.screenHeight;
    }


    public apply(canvas : Canvas) : void {

        canvas.moveTo(-this.pos.x, -this.pos.y);
    }
}
