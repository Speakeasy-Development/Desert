# Javascript simple game engine
Built to do simple turn based logic. The code structure is broken down into three major parts:

* I/O 
Input and output by default handled by taking in text lines from the index.html and passing them through logic modules (like game-commands.js) until the text command is matched.
By writing class that implement the same Submit() method, new command groups can be added or subtracted from the modules stack defined in index.html.
So for example, if you wish to add your own commands or create new ones from whole cloth either make a new module or add to the existing modules (like game-commands.js).


* Ruleset
The rules that game will operate by, how characters move, how events work. Examples (game-ruleset-sdn.js, game-entities.js)


* Entities
Data objects that tie together the rules into organizational objects. Think of these like objects in a game space, furniture, npcs, or items.

The general idea is that the I/O layer should call rules that manipulate and modify entities.