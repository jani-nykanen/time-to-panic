import { Walker } from "./walker.js";
import { Mushroom } from "./mushroom.js";
import { Bat } from "./bat.js";


export const getEnemyByIndex = (index : number) : Function => [

    Walker,
    Mushroom,
    Bat

][index] ?? Walker;
