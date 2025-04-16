import { Assets, ProgramEvent } from "../core/interface.js";
import { Bitmap, Canvas, Flip } from "../gfx/interface.js";
import { Camera } from "./camera.js";


export class Background {


    private typeIndex : number = 1;


    constructor(typeIndex : number = 1) {

        this.typeIndex = typeIndex;
    }


    private drawForest(canvas : Canvas, assets : Assets, camera : Camera) : void {

        const FOREST_HEIGHT : number = 112;
        const MOUNTAIN_Y : number = 48;

        const bmp : Bitmap | undefined = assets.getBitmap("background1");
        const bmpSky : Bitmap | undefined = assets.getBitmap("sky");

        canvas.clear(109, 182, 255);

        canvas.drawBitmap(bmpSky, Flip.None, 0, 0, 0, 0, canvas.width, canvas.height, canvas.width, canvas.height);
        

        const camX : number = camera.position.x;

        // Moon
        canvas.drawBitmap(bmp, Flip.None, camera.width - 80, 16, 0, 96, 64, 64);

        // Mountains
        let shiftx : number = -((camX/8.0) % 256);
        for (let i : number = 0; i < 3; ++ i) {

            canvas.drawBitmap(bmp, Flip.None, shiftx + i*256, MOUNTAIN_Y, 0, 160, 256, 128);
        }

        // Forest
        shiftx = -((camX/4.0) % 256);
        for (let i : number = 0; i < 3; ++ i) {

            canvas.drawBitmap(bmp, Flip.None, shiftx + i*256, camera.height - FOREST_HEIGHT, 0, 0, 256, 96);
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