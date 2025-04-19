import { Assets, ProgramEvent } from "../core/interface.js";
import { Align, Bitmap, Canvas } from "../gfx/interface.js";
import { GameState } from "./gamestate.js";


export class HUD {


    private state : GameState;
    private balanceText : string = "";

    private panicTimer : number = 0.0;


    constructor(state : GameState, event : ProgramEvent) {

        this.state = state;
    
        this.balanceText = event.localization?.getItem("balance")?.[0] ?? "";
    }


    private drawPanicText(canvas : Canvas, assets : Assets) : void {

        const bmp : Bitmap | undefined = assets.getBitmap("panic");
        if (bmp === undefined) {

            return;
        }

        const alpha : number = 0.5 + 0.25*Math.sin(this.panicTimer*Math.PI*2);

        canvas.setAlpha(alpha);
        canvas.drawVerticallyWavingBitmap(bmp, canvas.width/2 - bmp.width/2, 
            canvas.height/2 - bmp.height/2 - 16, 0, 0, bmp.width, bmp.height,
            Math.PI, 4.0, this.panicTimer*Math.PI*2);
        canvas.setAlpha();
    }


    public update(event : ProgramEvent) : void {

        const PANIC_SPEED : number = 1.0/60.0;

        if (this.state.money > 0) {

            this.panicTimer = 0.0;
            return;
        }

        this.panicTimer = (this.panicTimer + PANIC_SPEED*event.tick) % 1.0;
    }


    public draw(canvas : Canvas, assets : Assets) : void {

        // const SHADOW_ALPHA : number = 0.60;
        const DIGIT_COUNT : number = 4;
        const SHADOW_OFFSET : number = 1;

        const bmpFontOutlines : Bitmap | undefined = assets.getBitmap("font_outlines");

        canvas.setColor(0, 0, 0, 0.25);
        canvas.fillRect(0, canvas.height - 14, canvas.width, 14);


        const balanceStr : string = `${this.balanceText}: `;
        const moneyStr : string = String(Math.round(this.state.money));
        const finalMoneyStr : string = "$" + (moneyStr.length > DIGIT_COUNT ? 
            moneyStr : 
            "0".repeat(DIGIT_COUNT - moneyStr.length) + moneyStr);

        const width : number = (balanceStr.length + finalMoneyStr.length)*9;
        const leftx : number = canvas.width/2 - width/2;

        // for (let i : number = 1; i >= 0; -- i) {

            // canvas.moveTo(i*SHADOW_OFFSET, i*SHADOW_OFFSET);

            const magnitude : number = this.state.getMagnitude();
            const scale : number = 1.0 + 
                0.25*Math.abs(magnitude)*Math.sin(this.state.getMoneyChangeTimer()*Math.PI);

                /*
            if (i == 1) {

                canvas.setColor(0, 0, 0, SHADOW_ALPHA);
            }
            else {
            */
                if (this.state.money <= 0 || magnitude < 0) {

                    canvas.setColor(255, 143, 36);
                }
                else {
                
                    canvas.setColor(216, 255, 160);
                }
           // }

            if (this.state.money > 0 || this.panicTimer <= 0.5) {

                canvas.drawText(bmpFontOutlines, finalMoneyStr, 
                    leftx + balanceStr.length*9 - (scale - 1.0)*balanceStr.length*5/2.0, 
                    canvas.height - 15 - (scale - 1.0)*6, 
                    -7, 0, Align.Left, scale, scale);
            }

            //if (i == 0) {

                canvas.setColor(255, 255, 216);
            //}
            canvas.drawText(bmpFontOutlines, "BALANCE: ", 
                leftx, canvas.height - 15, 
                -7, 0, Align.Left);
        // }
        canvas.setColor();
    
        if (this.state.money <= 0) {

            this.drawPanicText(canvas, assets);
        }
    }
}
