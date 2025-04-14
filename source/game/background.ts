import { Assets, ProgramEvent } from "../core/interface.js";
import { Bitmap, Canvas, Flip } from "../gfx/interface.js";
import { Camera } from "./camera.js";


export class Background {


    private typeIndex : number = 1;


    constructor(typeIndex : number = 1) {

        this.typeIndex = typeIndex;
    }


    private drawForest(canvas : Canvas, assets : Assets, camera : Camera) : void {

        const FOREST_HEIGHT : number = 128;

        const bmp : Bitmap | undefined = assets.getBitmap("background1");

        canvas.clear(109, 182, 255);

        // Moon
        canvas.drawBitmap(bmp, Flip.None, camera.width - 80, 16, 0, 96, 64, 64);

        // Mountains
        for (let i : number = 0; i < 2; ++ i) {

            // ...
        }

        // Forest
        for (let i : number = 0; i < 2; ++ i) {

            canvas.drawBitmap(bmp, Flip.None, i*256, camera.height - FOREST_HEIGHT, 0, 0, 256, 96);
        }
        const yoff : number = FOREST_HEIGHT - 96;
        canvas.drawBitmap(bmp, Flip.None, 0, camera.height - yoff, 0, 64, 256, 32, camera.width, yoff);
    } 


    public draw(canvas : Canvas, assets : Assets, camera : Camera) : void {

        switch (this.typeIndex) {

        case 1:
            this.drawForest(canvas, assets, camera);
            break;

        default:
            break;
        }
    }
}