import { WebGLRenderer } from "./gfx/webgl/renderer.js";
import { GameScene } from "./game/game.js";
import { BaseProgram } from "./core/base/program.js";
import { WebAudioPlayer } from "./audio/webaudio/audioplayer.js";
import { ProgramEvent } from "./core/interface.js";
import { SETTINGS_LOCAL_STORAGE_KEY } from "./game/settings.js";
import { clamp } from "./common/mathutil.js";
import { TitleScreenScene } from "./game/titlescreen.js";
import { StoryScene } from "./game/story.js";


const loadSettings = (event : ProgramEvent) : void => {

    try {

        const str : string | null = window["localStorage"]["getItem"](SETTINGS_LOCAL_STORAGE_KEY);
        if (str === null) {

            return;
        }

        const json : unknown = JSON.parse(str) ?? {};

        const musicVolume : number = clamp(Number(json["musicvolume"]), 0, 100);
        const soundVolume : number = clamp(Number(json["soundvolume"]), 0, 100);

        if (window["nw"] !== undefined && json["fullscreen"] === "true") {

            window["nw"]?.["Window"]?.["get"]?.()?.["toggleFullscreen"]?.();
        }

        event.audio.setGlobalMusicVolume(musicVolume);
        event.audio.setGlobalSoundVolume(soundVolume);

    }
    catch (e) {

        console.warn(`Local storage error: ${e["message"]}`);
    }
}


const initialEvent = (event : ProgramEvent) : void => {

    event.assets.parseIndexFile("assets/index.json");

    event.input.addAction("jump", ["Space", "KeyZ"], [0], [0]);
    event.input.addAction("dash", ["ControlLeft", "ShiftLeft", "KeyX"], [2, 3]);
    event.input.addAction("pause", ["Enter", "Escape"], [7, 9]);
    event.input.addAction("back", ["Escape", "Backspace"], [1, 6, 8], undefined);
    event.input.addAction("select", ["Enter", "Space", "KeyZ", "KeyJ"], [0, 7, 9], [0]);
    event.input.addAction("start", ["Enter", "Space"], [0, 7, 9], [0]);

    event.audio.setGlobalMusicVolume(60);
    event.audio.setGlobalSoundVolume(60);

    loadSettings(event);
}


const onloadEvent = (event : ProgramEvent) : void => {

    const loc : string | undefined = event.assets.getDocument("en-us");
    if (loc !== undefined) {

        event.addLocalizationJSON("en-us", loc);
        event.setActiveLocalization("en-us");
    }

    event.scenes.addScene("titlescreen", new TitleScreenScene(event), true);
    event.scenes.addScene("story", new StoryScene(event), false);
    event.scenes.addScene("game", new GameScene(event), false);
}


const printError = (e : Error) : void => {

    console.log(e["stack"]);

    document.getElementById("base_div")?.remove();

    const textOut : HTMLElement = document.createElement("b");
    textOut.setAttribute("style", "color: rgb(224,73,73); font-size: 16px");
    textOut.innerText = "Fatal error:\n\n " + e["stack"];

    document.body.appendChild(textOut);
}


function waitForInitialEvent() : Promise<AudioContext> {

    return new Promise<AudioContext> ( (resolve : (ctx : AudioContext | PromiseLike<AudioContext>) => void) : void => {

        let activated : boolean = false;

        window.addEventListener("keydown", (e : KeyboardEvent) => {

            if (activated) {

                return;
            }
            activated = true;

            e.preventDefault();
            document.getElementById("div_initialize")?.remove();
    
            const ctx : AudioContext = new AudioContext();
            resolve(ctx);
    
        }, { once: true });

        // TODO: Repeating code, solve somehow (also check if the
        // AudioContext really need to be created in side an event
        // listener like I heard someone claiming long time ago).
        window.addEventListener("mousedown", (e : KeyboardEvent) => {

            if (activated) {

                return;
            }
            activated = true;

            e.preventDefault();
            document.getElementById("div_initialize")?.remove();
    
            const ctx : AudioContext = new AudioContext();
            resolve(ctx);
    
        }, { once: true });
    } );
}


window.onload = () => (async () => {
        
    document.getElementById("init_text")!.innerText = "Press Something to Start";

    const ctx : AudioContext = await waitForInitialEvent();

        try {

            const renderer : WebGLRenderer = new WebGLRenderer(400, 224, false);
            const audio : WebAudioPlayer = new WebAudioPlayer(ctx);

            (new BaseProgram(audio, renderer)).run(initialEvent, onloadEvent, printError);
        }
        catch (e : any) {

            printError(e);
        }
}) ();
