import { Walker } from "./walker.js";
import { Mushroom } from "./mushroom.js";
import { Bat } from "./bat.js";
import { Duck } from "./duck.js";
import { Apple } from "./apple.js";
import { Spikeball } from "./spikeball.js";
import { Rock } from "./rock.js";


export const getEnemyByIndex = (index : number) : Function => [

    Walker,
    Mushroom,
    Bat,
    Duck,
    Apple,
    Spikeball,
    Rock

][index] ?? Walker;
