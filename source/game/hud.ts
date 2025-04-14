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
        const moneyStr : string = String(this.state.money);
        const finalMoneyStr : string = "$" + (moneyStr.length > DIGIT_COUNT ? 
            moneyStr : 
            "0".repeat(DIGIT_COUNT - moneyStr.length) + moneyStr);

        const width : number = (balanceStr.length + finalMoneyStr.length)*9;
        const leftx : number = canvas.width/2 - width/2;

        for (let i : number = 1; i >= 0; -- i) {

            canvas.moveTo(i*SHADOW_OFFSET, i*SHADOW_OFFSET);

            if (i == 1) {

                canvas.setColor(0, 0, 0, SHADOW_ALPHA);
            }
            else {

                canvas.setColor(216, 255, 160);
            }
            canvas.drawText(bmpFontOutlines, finalMoneyStr, 
                leftx + balanceStr.length*9, canvas.height - 15, 
                -7, 0, Align.Left);

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
