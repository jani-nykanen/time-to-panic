import { Bitmap, Canvas, Flip } from "./interface.js";


export class AnimatedSprite {


    private columnIndex : number = 0;
    private rowIndex : number = 0;
    private timer : number = 0.0;

    private frameWidth : number;
    private frameHeight : number;


    public get width() : number {

        return this.frameWidth;
    }
    public get height() : number {

        return this.frameHeight;
    }


    public get column() : number {

        return this.columnIndex;
    }
    public get row() : number {

        return this.rowIndex;
    }


    constructor(width : number = 0, height : number = 0) {

        this.frameWidth = width;
        this.frameHeight = height;
    }


    private nextFrame(dir : number, startFrame : number, endFrame : number) : void {

        this.columnIndex += dir;

        const min : number = Math.min(startFrame, endFrame);
        const max : number = Math.max(startFrame, endFrame);

        if (this.columnIndex < min) {

            this.columnIndex = max;
        }
        else if (this.columnIndex > max) {

            this.columnIndex = min;
        }
    } 

    
    public animate(rowIndex : number,
        startFrame : number, endFrame : number, 
        frameTime : number, step : number) : void {

        // To avoid semi-infinite loops
        const MAX_FRAME_SKIP : number = 5;
        // Non-positive frame speed means that the frame changes
        // infinitely fast, thus we do not animate at all.
        // (TODO: Negative speed can also mean frame skip, though.)
        if (frameTime <= 0) {

            return;
        }

        const dir : number = Math.sign(endFrame - startFrame);

        if (rowIndex != this.rowIndex) {
            
            this.columnIndex = startFrame;
            this.timer = 0;

            this.rowIndex = rowIndex;
        }

        this.timer += step;
 
        let frameSkipCount : number = 0;
        while (this.timer >= frameTime) {

            this.timer -= frameTime;
            this.nextFrame(dir, startFrame, endFrame);

            ++ frameSkipCount;
            if (frameSkipCount >= MAX_FRAME_SKIP) {

                this.timer = 0;
                break;
            }
        }
        
    }


    public draw(canvas : Canvas, bmp : Bitmap | undefined, 
        dx : number, dy : number, flip : Flip = Flip.None,
        scalex : number = this.width, scaley : number = this.height) : void {

        this.drawShifted(canvas, bmp, 0, 0, dx, dy, flip, scalex, scaley);
    }


    public drawShifted(canvas : Canvas, bmp : Bitmap | undefined, 
        columnShift : number = 0, rowShift : number = 0,
        dx : number, dy : number, flip : Flip = Flip.None,
        scalex : number = this.width, scaley : number = this.height) : void {

        canvas.drawBitmap(bmp, flip, dx, dy, 
            (this.columnIndex + columnShift)*this.width, 
            (this.rowIndex + rowShift)*this.height, 
            this.width, this.height, scalex, scaley);
    }


    public setFrame(columnIndex : number, rowIndex : number, preserveTimer : boolean = false) : void {

        this.columnIndex = columnIndex;
        this.rowIndex = rowIndex;

        if (!preserveTimer) {
            
            this.timer = 0.0;
        }
    }


    public resize(newWidth : number, newHeight : number) : void {

        this.frameWidth = newWidth;
        this.frameHeight = newHeight;
    }

    
    public getFrameTime = () : number => this.timer;
}
