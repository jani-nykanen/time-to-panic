![](https://img.itch.zone/aW1nLzIwODQ3OTEzLnBuZw==/original/0KC62y.png)


## Time to Panic!

...is a platformer thing made for GameDev.js Jam 2025. 

### [Click here to play](https://jani-nykanen.itch.io/time-to-panic)


-----


## Building


The following tools are required:
- **TypeScript compiler**
- **Git LFS** (to get access to the asset files)
- **Closure compiler** (optional)

To build the game, clone the repo
```
git clone https://github.com/jani-nykanen/time-to-panic
```
and run 
```
tsc
```
(or `make js` if you have `make` installed). It will compile the TypeScript source to Javascript, and you can run the game by starting a server in the root (for example run `make server` and open `localhost:8000` in your browser).

If you want to compile a redistributable and compressed zip package, run 
```
make CLOSURE_PATH=<path to closure jar file> dist 
```
(there is a bug that requires you to run `tsc` first, otherwise the thing will faill).

If you want to make a lot of changes to the source, it is recommended to compile the source in watch mode (`tsc -w` or `make watch`).


-----


## License

The game uses the following licenses:
1. [MIT license](https://opensource.org/license/mit) for all the source code files, which contain all `.html`, `.css`, `.json` and `.ts` (and `makefile`) files.
2. [CC BY-NC 4.0 DEED](https://creativecommons.org/licenses/by-nc/4.0/deed.en) for all asset files in the `assets` folder **(excluding .ogg files, see below)**  and should be attributed to Jani Nykänen.
3. [CC BY-NC 4.0 DEED](https://creativecommons.org/licenses/by-nc/4.0/deed.en) for all `.ogg` files in the `assets/audio` folder and should be attributed to H0dari.


