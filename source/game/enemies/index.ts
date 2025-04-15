import { Walker } from "./walker.js";
import { Mushroom } from "./mushroom.js";
import { Bat } from "./bat.js";
import { Duck } from "./duck.js";


export const getEnemyByIndex = (index : number) : Function => [

    Walker,
    Mushroom,
    Bat,
    Duck

][index] ?? Walker;
