import { clamp } from "../common/mathutil.js";
import { ProgramEvent } from "../core/interface.js";


export class GameState {


    private initialMoneyCount : number = 0;
    private moneyCount : number = 0;
    private moneyCountTarget : number = 0;
    private moneyChangeTimer : number = 0;

    private feeRate : number = 0;
    private frameCount : number = 0;

    private pauseTimer : number = 0;

    private magnitude : number = 0.0;


    public get money() : number {

        return this.moneyCount;
    }


    constructor(initialMoney : number, feeRate : number) {

        this.moneyCount = initialMoney;
        this.moneyCountTarget = initialMoney;
        this.feeRate = feeRate;
    }


    public update(event : ProgramEvent) : void {

        const MONEY_CHANGE_TIME : number = 1.0/20.0;

        if (this.moneyChangeTimer > 0) {

            this.moneyChangeTimer = Math.max(0, this.moneyChangeTimer - MONEY_CHANGE_TIME*event.tick);
            this.moneyCount = this.moneyChangeTimer*this.initialMoneyCount + (1.0 - this.moneyChangeTimer)*this.moneyCountTarget;

            return;
        }
        this.magnitude = 0;

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

        this.initialMoneyCount = this.moneyCountTarget;
        this.moneyCountTarget = clamp(this.moneyCountTarget + count, 0, 9999);
        this.moneyChangeTimer = 1.0;

        this.magnitude = count/5;
        
        this.pauseTimer = PAUSE_TIME;
    }


    public getMoneyChangeTimer() : number {

        return this.moneyChangeTimer;
    }


    public getMagnitude() : number {

        return this.magnitude;
    }
}
