import { ProgramEvent } from "../core/interface.js";


export class GameState {


    private moneyCount : number = 0;
    private feeRate : number = 0;
    private frameCount : number = 0;


    public get money() : number {

        return this.moneyCount;
    }


    constructor(initialMoney : number = 1000, feeRate : number = 6) {

        this.moneyCount = initialMoney;
        this.feeRate = feeRate;
    }


    public update(event : ProgramEvent) : void {

        ++ this.frameCount;
        while (this.frameCount >= this.feeRate) {

            -- this.moneyCount;
            this.frameCount -= this.feeRate;
        }
    }
}