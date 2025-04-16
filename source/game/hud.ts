import { Assets, ProgramEvent } from "../core/interface.js";
import { Align, Bitmap, Canvas } from "../gfx/interface.js";
import { GameState } from "./gamestate.js";



export class HUD {


    private state : GameState;


    constructor(state : GameState) {

        this.state = state;
    }


    public update(event : ProgramEvent) : void {

        // TODO: Animations etc.
    }


    public draw(canvas : Canvas, assets : Assets) : void {

        const SHADOW_ALPHA : number = 0.60;
        const DIGIT_COUNT : number = 4;
        const SHADOW_OFFSET : number = 1;

        const bmpFontOutlines : Bitmap | undefined = assets.getBitmap("font_outlines");

        canvas.setColor(0, 0, 0, 0.25);
        canvas.fillRect(0, canvas.height - 14, canvas.width, 14);

        const balanceStr : string = "BALANCE: ";
        const moneyStr : string = String(Math.round(this.state.money));
        const finalMoneyStr : string = "$" + (moneyStr.length > DIGIT_COUNT ? 
            moneyStr : 
            "0".repeat(DIGIT_COUNT - moneyStr.length) + moneyStr);

        const width : number = (balanceStr.length + finalMoneyStr.length)*9;
        const leftx : number = canvas.width/2 - width/2;

        for (let i : number = 1; i >= 0; -- i) {

            canvas.moveTo(i*SHADOW_OFFSET, i*SHADOW_OFFSET);

            
            const magnitude : number = this.state.getMagnitude();
            const scale : number = 1.0 + 
                0.25*Math.abs(magnitude)*Math.sin(this.state.getMoneyChangeTimer()*Math.PI);

            if (i == 1) {

                canvas.setColor(0, 0, 0, SHADOW_ALPHA);
            }
            else {

                if (magnitude < 0) {

                    canvas.setColor(255, 143, 36);
                }
                else {
                
                    canvas.setColor(216, 255, 160);
                }
            }

            canvas.drawText(bmpFontOutlines, finalMoneyStr, 
                leftx + balanceStr.length*9 - (scale - 1.0)*balanceStr.length*5/2.0, 
                canvas.height - 15 - (scale - 1.0)*6, 
                -7, 0, Align.Left, scale, scale);

            if (i == 0) {

                canvas.setColor(255, 255, 216);
            }
            canvas.drawText(bmpFontOutlines, "BALANCE: ", 
                leftx, canvas.height - 15, 
                -7, 0, Align.Left);
        }

        canvas.setColor();
    }
}
