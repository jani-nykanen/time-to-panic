import { clamp } from "../common/mathutil.js";
import { ProgramEvent } from "../core/interface.js";


export class GameState {


    private moneyCount : number = 0;
    private moneyCountTarget : number = 0;
    private moneySpeed : number = 1;

    private feeRate : number = 0;
    private frameCount : number = 0;

    private pauseTimer : number = 0;


    public get money() : number {

        return this.moneyCount;
    }


    constructor(initialMoney : number, feeRate : number) {

        this.moneyCount = initialMoney;
        this.moneyCountTarget = initialMoney;
        this.feeRate = feeRate;
    }


    public update(event : ProgramEvent) : void {

        if (this.moneyCount != this.moneyCountTarget) {

            if (this.moneyCountTarget < this.moneyCount) {

                this.moneyCount = Math.max(this.moneyCountTarget, this.moneyCount - this.moneySpeed*event.tick);
            }
            else {

                this.moneyCount = Math.min(this.moneyCountTarget, this.moneyCount + this.moneySpeed*event.tick);
            }
            return;
        }

        if (this.pauseTimer > 0) {

            this.pauseTimer -= event.tick;
            return;
        }

        ++ this.frameCount;
        while (this.frameCount >= this.feeRate) {

            this.moneyCount = Math.max(0, this.moneyCount - 1);
            this.moneyCountTarget = this.moneyCount;
            this.frameCount -= this.feeRate;
        }
    }


    public addMoney(count : number) : void {

        const PAUSE_TIME : number = 15;

        this.moneyCountTarget = clamp(this.moneyCountTarget + count, 0, 9999);
        this.moneySpeed = Math.ceil(Math.abs(this.moneyCountTarget - this.money)/25);
    
        this.pauseTimer = PAUSE_TIME;
    }
}