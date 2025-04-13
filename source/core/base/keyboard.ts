import { InputState, Keyboard } from "../interface.js";


export class InternalKeyState {

    public state : InputState = InputState.Up;
    public timestamp : number = 0.0;
}


export class BaseKeyboard implements Keyboard {


    private states : Map<string, InternalKeyState>;
    private prevent : Array<string>;

    private anyPressed : boolean = false;

    private used : boolean = false;


    constructor() {

        this.states = new Map<string, InternalKeyState> ();
        this.prevent = new Array<string> ("ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", "KeyA", "KeyS", "KeyD", "KeyW");

        window.addEventListener("keydown", (e : any) => {

            this.keyEvent(true, e.code, Date.now());
            if (this.prevent.includes(e.code)) {

                e.preventDefault();
            }
            
        });
        window.addEventListener("keyup", (e : any) => {

            this.keyEvent(false, e.code, Date.now());
            if (this.prevent.includes(e.code)) {

                e.preventDefault();
            }
        });  
    }


    private keyEvent(down : boolean, key : string, timestamp : number = 0.0) : void {

        this.used = true;

        let state : InternalKeyState | undefined = this.states.get(key);
        if (state === undefined) {

            state = new InternalKeyState();
            this.states.set(key, state);
        }

        if (down) {

            if (state.state === InputState.Down) {

                return;
            }
            state.state = InputState.Pressed;
            state.timestamp = timestamp;
            this.anyPressed = true;
            return;
        }

        if (state.state === InputState.Up) {

            return;
        }
        state.state = InputState.Released;
        state.timestamp = timestamp;
    }


    public update() : void {

        for (const k of this.states.keys()) {

            const state : InternalKeyState = this.states.get(k);

            if (state.state === InputState.Pressed) {

                state.state = InputState.Down;
            }
            else if (state.state == InputState.Released) {

                state.state = InputState.Up;
            }
        }

        this.anyPressed = false;
        this.used = false;
    }


    public getKeyState(name : string) : InputState {

        return this.states.get(name)?.state ?? InputState.Up;
    }


    public getTimestamp(name : string) : number {

        return this.states.get(name)?.timestamp ?? 0.0;
    }


    public isAnyPressed = () : boolean => this.anyPressed;
    public wasUsed = () : boolean => this.used;


    public preventKey(key : string) : void {

        this.prevent.push(key);
    } 


    public flush() : void {

        for (const k of this.states.keys()) {

            const state : InternalKeyState = this.states.get(k);
            state.state = InputState.Up;
        }
    }


    // For internal use only 
    public getInternalKeyState(name : string) : InternalKeyState | undefined {

        return this.states.get(name);
    }
}
