import { Input, InputState } from "../interface.js";
import { BaseKeyboard, InternalKeyState } from "./keyboard.js";
import { BaseGamePad } from "./gamepad.js";
import { Vector } from "../../common/vector.js";
import { BaseMouse } from "./mouse.js";
import { ProgramEvent } from "../interface.js";


const INPUT_DIRECTION_DEADZONE : number = 0.1;


class InputAction {


    public keys : Array<string>;
    public gamepadButtons : Array<number>;
    public mouseButtons : Array<number>;

    constructor(keys : Array<string>, gamepadButtons : Array<number>, mouseButtons : Array<number>) {

        this.keys = Array.from(keys);
        this.gamepadButtons = Array.from(gamepadButtons);
        this.mouseButtons = Array.from(mouseButtons);
    }
}


export class BaseInput implements Input {


    private actions : Map<string, InputAction>;

    // Note: add more than one "virtual stick"
    private oldStick : Vector;
    private vstick : Vector;
    private stickDelta : Vector;

    private anyPressed : boolean = false;
    private keyboardAndMouseActive : boolean = true;
    private gamepadActive : boolean = false;

    public readonly keyboard : BaseKeyboard;
    public readonly gamepad : BaseGamePad;
    public readonly mouse : BaseMouse;


    public get stick() : Vector {

        return this.vstick.clone();
    }


    constructor() {

        this.actions = new Map<string, InputAction> ();

        this.vstick = new Vector();
        this.oldStick = new Vector();
        this.stickDelta = new Vector();

        this.keyboard = new BaseKeyboard();
        this.gamepad = new BaseGamePad();
        this.mouse = new BaseMouse();

        // These are used to determine the player direction
        // more easily when using a keyboard
        this.addAction("right", ["ArrowRight", "KeyD"], [15]);
        this.addAction("up",    ["ArrowUp",    "KeyW"], [12]);
        this.addAction("left",  ["ArrowLeft",  "KeyA"], [14]);
        this.addAction("down",  ["ArrowDown",  "KeyS"], [13]);
    }


    private getActionWithTimestamp(name : string) : [InputState, number | undefined] {

        const action : InputAction | undefined = this.actions.get(name);
        if (action === undefined) {

            return [InputState.Up, 0.0];
        }

        for (const key of action.keys) {

            const state : InternalKeyState | undefined = this.keyboard.getInternalKeyState(key);
            if (state !== undefined && state.state != InputState.Up) {

                return [state.state, state.timestamp];
            }
        }

        for (const button of action.gamepadButtons) {

            const state : InputState = this.gamepad.getButtonState(button);
            if (state != InputState.Up) {

                return [state, 0.0];
            }
        }

        for (const button of action.mouseButtons) {

            const state : InputState = this.mouse.getButtonState(button);
            if (state != InputState.Up) {
                
                return [state, 0.0];
            }
        }

        return [InputState.Up, 0.0];
    }


    public addAction(name : string, 
        keys : Array<string>, 
        gamepadButtons : Array<number> | undefined = undefined, 
        mouseButtons : Array<number> | undefined = undefined,
        prevent : boolean = true) : void {

        this.actions.set(name, new InputAction(keys, gamepadButtons ?? [], mouseButtons ?? []));
        if (prevent) {

            for (const k of keys) {

                this.keyboard.preventKey(k);
            }
        }
    }


    public preUpdate() : void {

        const DEADZONE : number = 0.25;

        this.oldStick = this.vstick.clone();
        this.vstick.zero();

        let stick : Vector = new Vector();

        // Timestamp is used to priorize the correct input action
        // when using a keyboard.
        const left : [InputState, number] = this.getActionWithTimestamp("left");
        const right : [InputState, number] = this.getActionWithTimestamp("right");
        const up : [InputState, number] = this.getActionWithTimestamp("up");
        const down : [InputState, number] = this.getActionWithTimestamp("down");

        const maxTimestampHorizontal : number = Math.max(left[1], right[1]);
        const maxTimestampVertical : number = Math.max(up[1], down[1]);

        if (left[1] >= maxTimestampHorizontal &&
            (left[0] & InputState.DownOrPressed) != 0) {

            stick.x = -1;
        }
        else if (right[1] >= maxTimestampHorizontal &&
            (right[0] & InputState.DownOrPressed) != 0) {

            stick.x = 1;
        }
        if (up[1] >= maxTimestampVertical &&
            (up[0] & InputState.DownOrPressed) != 0) {

            stick.y = -1;
        }
        if (down[1] >= maxTimestampVertical &&
            (down[0] & InputState.DownOrPressed) != 0) {

            stick.y = 1;
        }

        if (stick.length < DEADZONE) {

            stick = this.gamepad.stick;
        }
        // Note: this and above are not exclusive!
        if (stick.length >= DEADZONE) {

            this.vstick = stick;
        }

        this.stickDelta.x = this.vstick.x - this.oldStick.x;
        this.stickDelta.y = this.vstick.y - this.oldStick.y;

        this.anyPressed = this.keyboard.isAnyPressed() || 
            this.gamepad.isAnyPressed() || 
            this.mouse.isAnyPressed();

        if (this.gamepad.wasUsed()) {

            this.gamepadActive = true;
            this.keyboardAndMouseActive = false;
        }
        
        if (this.keyboard.wasUsed() || this.mouse.wasUsed()) {

            this.keyboardAndMouseActive = true;
            this.gamepadActive = false;
        }
    }


    public update(event : ProgramEvent) : void {

        this.keyboard.update();
        this.gamepad.update();
        this.mouse.update(event);
    }


    public getAction(name : string) : InputState {

        return this.getActionWithTimestamp(name)[0];
    }


    public upPress() : boolean {

        return this.stick.y < 0 && 
            this.oldStick.y >= -INPUT_DIRECTION_DEADZONE &&
            this.stickDelta.y < -INPUT_DIRECTION_DEADZONE;
    }


    public downPress() : boolean {

        return this.stick.y > 0 && 
            this.oldStick.y <= INPUT_DIRECTION_DEADZONE &&
            this.stickDelta.y > INPUT_DIRECTION_DEADZONE;
    }


    public leftPress() : boolean {

        return this.stick.x < 0 && 
            this.oldStick.x >= -INPUT_DIRECTION_DEADZONE &&
            this.stickDelta.x < -INPUT_DIRECTION_DEADZONE;
    }

    
    public rightPress() : boolean {

        return this.stick.x > 0 && 
            this.oldStick.x <= INPUT_DIRECTION_DEADZONE &&
            this.stickDelta.x > INPUT_DIRECTION_DEADZONE;
    }


    public isAnyPressed = () : boolean => this.anyPressed;


    public isKeyboardAndMouseActive = () : boolean => this.keyboardAndMouseActive;
    public isGamepadActive = () : boolean => this.gamepadActive;
}
