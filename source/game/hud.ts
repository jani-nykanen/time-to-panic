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

        const DIGIT_COUNT : number = 4;
        const MONEY_XOFF : number = 34;

        const bmpFontOutlines : Bitmap | undefined = assets.getBitmap("font_outlines");

        canvas.setColor(0, 0, 0, 0.25);
        canvas.fillRect(0, canvas.height - 14, canvas.width, 14);

        const moneyStr : string = String(this.state.money);
        const finalMoneyStr : string = "$" + (moneyStr.length > DIGIT_COUNT ? 
            moneyStr : 
            "0".repeat(DIGIT_COUNT - moneyStr.length) + moneyStr);

        canvas.setColor(216, 255, 160);
        canvas.drawText(bmpFontOutlines, finalMoneyStr, 
            MONEY_XOFF + canvas.width/2 - 8, canvas.height - 15, 
            -7, 0, Align.Center);

        canvas.setColor(255, 255, 216);
        canvas.drawText(bmpFontOutlines, "BALANCE: ", 
            MONEY_XOFF + canvas.width/2 - finalMoneyStr.length*4, canvas.height - 15, 
            -7, 0, Align.Right);

        canvas.setColor();
    }
}
