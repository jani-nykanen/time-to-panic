import { Assets, ProgramEvent, InputState } from "../core/interface.js";
import { Canvas } from "../gfx/interface.js";
import { Menu } from "../ui/menu.js";
import { MenuButton } from "../ui/menubutton.js";


export const SETTINGS_LOCAL_STORAGE_KEY : string = "justgiveup_settings";


export class Settings {


    private menu : Menu;
    private backEvent : ((event : ProgramEvent) => void) | undefined = undefined;


    constructor(event : ProgramEvent, backEvent? : (event : ProgramEvent) => void) {

        this.backEvent = backEvent;

        const text : string[] = event.localization?.getItem("settings") ?? [];

        this.menu = new Menu(this.createMenuButtons(text));   
    }


    private createMenuButtons(text : string[]) : MenuButton[] {

        return [
            // NOTE: The actual button text will be set by the "activate" function, we just
            // pass something here to compute the correct size for the menu box.
            new MenuButton((text[0] ?? "null") + ": 100%",
                undefined,
                (event : ProgramEvent) : void => {

                    event.audio.setGlobalSoundVolume(event.audio.getGlobalSoundVolume() - 10);
                    this.updateSoundButtonText(event);
                },
                (event : ProgramEvent) : void => {

                    event.audio.setGlobalSoundVolume(event.audio.getGlobalSoundVolume() + 10);
                    this.updateSoundButtonText(event);
                }
            ),

            new MenuButton((text[1] ?? "null") + ": 100%",
                undefined,
                (event : ProgramEvent) : void => {
                    
                    event.audio.setGlobalMusicVolume(event.audio.getGlobalMusicVolume() - 10);
                    this.updateSoundButtonText(event);
                },
                (event : ProgramEvent) : void => {

                    event.audio.setGlobalMusicVolume(event.audio.getGlobalMusicVolume() + 10);
                    this.updateSoundButtonText(event);
                }
            ),

            new MenuButton(text[3] ?? "null",
                (event : ProgramEvent) : void => {
    
                    this.deactivate();
                    this.backEvent?.(event);
                    this.save(event);
                })
        ];
    }


    private updateSoundButtonText(event : ProgramEvent) : void {

        const soundVolume : number = event.audio.getGlobalSoundVolume();
        const musicVolume : number = event.audio.getGlobalMusicVolume();

        const text : string[] = event.localization?.getItem("settings") ?? [];

        this.menu.changeButtonText(0, `${text[0]}: ${soundVolume}%`);
        this.menu.changeButtonText(1, `${text[1]}: ${musicVolume}%`);
    }


    public save(event : ProgramEvent) : void {

        try {

            const output : any = {};

            output["musicvolume"] = String(event.audio.getGlobalMusicVolume());
            output["soundvolume"] = String(event.audio.getGlobalSoundVolume());
            window["localStorage"]["setItem"](SETTINGS_LOCAL_STORAGE_KEY, JSON.stringify(output));

        }
        catch (e) {

            console.warn(`Error accessing local storage: ${e["message"]}.`);
        }
    }


    public update(event : ProgramEvent, allowBack : boolean = false) : void {

        if (!this.isActive()) {

            return;
        }

        if (allowBack &&
            event.input.getAction("back") == InputState.Pressed) {

            this.deactivate();
            event.audio.playSample(event.assets.getSample("deny"), 0.70);

            return;
        }

        this.menu.update(event);
    }


    public draw(canvas : Canvas, assets : Assets, x : number = 0, y : number = 0) : void {

        this.menu.draw(canvas, assets, x, y, -2);
    }


    public activate(event : ProgramEvent) : void {

        this.updateSoundButtonText(event);
        this.menu.activate(2);
    }


    public deactivate() : void {

        this.menu.deactivate();
    }


    public isActive = () : boolean => this.menu.isActive();
}