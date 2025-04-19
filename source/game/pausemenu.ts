import { Assets, ProgramEvent, InputState } from "../core/interface.js";
import { Canvas } from "../gfx/interface.js";
import { ConfirmationBox } from "../ui/confirmationbox.js";
import { Menu } from "../ui/menu.js";
import { MenuButton } from "../ui/menubutton.js";
import { TextBox } from "../ui/textbox.js";
import { Settings } from "./settings.js";


export class PauseMenu {


    private menu : Menu;
    private restartBox : ConfirmationBox;
    private settings : Settings;

    private active : boolean = false;


    constructor(event : ProgramEvent,
        restartEvent : ((event : ProgramEvent) => void) | undefined = undefined) {

        const menuText : string[] = event.localization?.getItem("pause_menu") ?? [];

        const strYes : string = event.localization?.getItem("yes")?.[0] ?? "null";
        const strNo : string = event.localization?.getItem("no")?.[0] ?? "null";

        this.menu = new Menu(
            [
            // Resume
            new MenuButton(menuText[0] ?? "null",
            (event : ProgramEvent) => {
    
                // event.audio.resumeMusic();
                this.deactivate();
                // resumeEvent(event);
            }),
    
            // Restart
            new MenuButton(menuText[1] ?? "null",
            (event : ProgramEvent) => {
                
                this.restartBox.activate(1);
            }),

            // Settings
            new MenuButton(menuText[2] ?? "null",
            (event : ProgramEvent) => {
    
                this.settings.activate(event);
            })
        ], false);

        // Restart box
        this.restartBox = new ConfirmationBox([strYes, strNo], 
            event.localization?.getItem("restart")?.[0] ?? "null",
            (event : ProgramEvent) => {

                restartEvent?.(event);
                this.deactivate();
            },
            (event : ProgramEvent) => {

                this.restartBox.deactivate();
            }
        );

        // Settings
        this.settings = new Settings(event);
    }

    public update(event : ProgramEvent) : void {

        if (!this.active) {

            return;
        }

        if (this.restartBox.isActive()) {

            this.restartBox.update(event);
            return;
        }
        
        if (this.settings.isActive()) {

            this.settings.update(event, true);
            return;
        }

        if (event.input.getAction("back") == InputState.Pressed) {

            // event.audio.resumeMusic();
            this.deactivate();
            event.audio.playSample(event.assets.getSample("deny"), 0.70);

            return;
        }
        this.menu.update(event);
    }


    public draw(canvas : Canvas, assets : Assets) : void {

        const DARKEN_MAGNITUDE : number = 0.50;

        if (!this.active) {

            return;
        }

        canvas.setColor(0, 0, 0, DARKEN_MAGNITUDE);
        canvas.fillRect();
        canvas.setColor();

        if (this.restartBox.isActive()) {

            this.restartBox.draw(canvas, assets);
            return;
        }
        if (this.settings.isActive()) {

            this.settings.draw(canvas, assets);
            return;
        }
        this.menu.draw(canvas, assets, 0, 0, -2);
    }


    public activate() : void {

        this.active = true;

        this.menu.activate(0);
        this.restartBox?.deactivate();
    }


    public deactivate() : void {

        this.active = false;

        this.menu.deactivate();
        this.restartBox?.deactivate();
    }


    public isActive = () : boolean => this.active;
}
