import { Vector } from "../../common/vector.js";
import { ProgramEvent, InputState, Mouse } from "../interface.js";


export class BaseMouse implements Mouse {


    private buttonStates : Map<number, InputState>;
    private prevent : Array<number>;
    private anyPressed : boolean = false;

    private unitPos : Vector;
    private scaledPos : Vector;

    private used : boolean = false;


    constructor() {

        this.unitPos = new Vector();
        this.scaledPos = new Vector();

        this.prevent = new Array<number> ();

        this.buttonStates = new Map<number, InputState> ();

        window.addEventListener("mousedown", (ev : MouseEvent) => {

            this.buttonEvent(true, ev.button);
            if (this.prevent.includes(ev.button)) {

                ev.preventDefault();
            }

            // TODO: Redundant?
            window.focus();
        });
        window.addEventListener("mouseup", (ev : MouseEvent) => {

            this.buttonEvent(false, ev.button);
            if (this.prevent.includes(ev.button)) {

                ev.preventDefault();
            }
        });  

        window.addEventListener("mousemove", (ev : MouseEvent) : void => {

            this.movementEvent(ev.clientX, ev.clientY);
            // window.focus();
        });

        window.addEventListener("contextmenu", (ev : MouseEvent) => {ev.preventDefault();});
    }


    private movementEvent(x : number, y : number) : void {

        this.used = true;

        this.unitPos.x = x/window.innerWidth;
        this.unitPos.y = y/window.innerHeight;
    }


    private buttonEvent(down : boolean, button : number) : void {

        this.used = true;

        if (down) {

            if (this.buttonStates.get(button) === InputState.Down) {

                return;
            }
            this.buttonStates.set(button, InputState.Pressed);
            this.anyPressed = true;
            return;
        }

        if (this.buttonStates.get(button) === InputState.Up) {

            return;
        }
        this.buttonStates.set(button, InputState.Released);
    }


    public computeScaledPosition(event : ProgramEvent) : void {

        this.scaledPos.x = Math.round(this.unitPos.x*event.screenWidth);
        this.scaledPos.y = Math.round(this.unitPos.y*event.screenHeight);
    }


    public update(event : ProgramEvent) : void {

        this.computeScaledPosition(event);

        for (const k of this.buttonStates.keys()) {
    
            if (this.buttonStates.get(k) === InputState.Pressed) {
    
                this.buttonStates.set(k, InputState.Down);
            }
            else if (this.buttonStates.get(k) === InputState.Released) {
    
                this.buttonStates.set(k, InputState.Up);
            }
        }
        this.anyPressed = false;
        this.used = false;
    }


    public getButtonState(button : number) : InputState {

        return this.buttonStates.get(button) ?? InputState.Up;
    }


    public preventButton(button : number) : void {

        this.prevent.push(button);
    } 
    

    public isAnyPressed = () : boolean => this.anyPressed;
    public wasUsed = (): boolean => this.used;

    public getCursorPosition = () : Vector => this.scaledPos.clone();
    public getCursorUnitPosition = (): Vector => this.unitPos.clone();
}
