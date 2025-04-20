import { Vector } from "../common/vector.js";
import { Assets, ProgramEvent } from "../core/interface.js";
import { Align, Bitmap, Canvas } from "../gfx/interface.js";



export class Hints {


    private hints : string[][];
    private hintsShown : boolean[];
    private hintSizes : Vector[][];
    private activeHint : number = 0;
    private hintType : number = 0;
    private hintsLeft : boolean = false;


    constructor(event : ProgramEvent) {

        this.hints = new Array<string[]> (2);
        this.hintSizes = new Array<Vector[]> (2);

        this.hints[0] = event.localization?.getItem("hints_kb") ?? [];
        this.hints[1] = event.localization?.getItem("hints_gp") ?? [];

        for (let j : number = 0; j < 2; ++ j) {

            this.hintSizes[j] = new Array<Vector> ();
            for (const h of this.hints[j]) {

                const lines : string[] = h.split("\n");
                this.hintSizes[j].push(new Vector(
                    Math.max(...lines.map((s : string) => s.length)),
                    lines.length
                ));
            }
        }

        this.hintsShown = new Array<boolean> (Math.max(this.hints[0].length, this.hints[1].length)).fill(false);
        this.hintsLeft = this.hintsShown.length > 0;
        this.hintType = event.input.isGamepadActive() ? 1 : 0;
    }


    public update(event : ProgramEvent) : void {

        this.hintType = event.input.isGamepadActive() ? 1 : 0;
    }


    public nextHint() : void {

        if (!this.hintsLeft) {

            return;
        }

        ++ this.activeHint;
        if (this.activeHint >= this.hintsShown.length) {

            this.hintsLeft = false;
        }
    }


    public drawHint(canvas : Canvas, assets : Assets) : void {

        const YOFF : number = 20;
        const CHAR_YOFF : number = -2;

        if (!this.hintsLeft) {

            return;
        }

        const activeHint : string | undefined = this.hints[this.hintType]?.[this.activeHint];
        if (activeHint === undefined) {

            return;
        }

        const bmpFont : Bitmap | undefined = assets.getBitmap("font_outlines");

        const size : Vector = this.hintSizes[this.hintType]?.[this.activeHint] ?? new Vector();
        const dx : number = canvas.width/2 - size.x/2*8;
        const dy : number = YOFF;
    
        canvas.setColor(0, 0, 0, 0.33);
        canvas.fillRect(dx - 4, dy - 4, (size.x + 1)*8 + 8, size.y*(16 + CHAR_YOFF) + 8);
        
        canvas.setColor(255, 255, 143);
        canvas.drawText(bmpFont, activeHint, dx, dy, -8, CHAR_YOFF, Align.Left);
        canvas.setColor();
    }


    public reset() : void {

        this.activeHint = 0;
        this.hintsLeft = true;

        for (let i : number = 0; i < this.hintsShown.length; ++ i) {

            this.hintsShown[i] = false;
        }
    }
}