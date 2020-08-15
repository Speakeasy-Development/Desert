// Use this file to setup the initial game states, this will execute at the end of all the other files in the folder, but afterwards the game is open for player input
//Game setup
// Starting Command Module for game inputs
commandModules.push(new commands_game());

//Setup the world
var World = new World(300, 300);

//Setup the player
// Player data, no turn logic needed (as that is done by the game itself), data is flag to indicate if hostiles nearby, and a ring of seeing objects
var PlayerCoreStats = new CoreStats(2,2,2, "you");

// Define player specifics
PlayerCoreStats.HasRifle = true;
PlayerCoreStats.Ammo = 0;
PlayerCoreStats.AmmoLimit = 8;
PlayerCoreStats.Healing = 0;
PlayerCoreStats.HealingLimit = 3;
PlayerCoreStats.VictoryItems = 0;
PlayerCoreStats.Victory = false;

PlayerCoreStats.ChangeHealing = function(amount){
	// Space remaining
	var spaceLeft = this.HealingLimit - this.Healing;
	var amountTaken = 0;
	
	if(spaceLeft > 0){
		// There is space left
		amountTaken = spaceLeft - amount;
		
		if(amountTaken >= 0){
			// Space remaining means all was taken
			amountTaken = amount;
		}else{
			// negative space remaining means not all was taken
			amountTaken = amount + amountTaken;
		}
	}
	
	this.Healing += amountTaken;
	
	return amountTaken
};

// Change the amount of player ammunition and return the amount taken
PlayerCoreStats.ChangeAmmo = function(amount){		

	// Space remaining
	var spaceLeft = this.AmmoLimit - this.Ammo;
	var amountTaken = 0;
	
	if(spaceLeft > 0){
		// There is space left
		amountTaken = spaceLeft - amount;
		
		if(amountTaken >= 0){
			// Space remaining means all was taken
			amountTaken = amount;
		}else{
			// negative space remaining means not all was taken
			amountTaken = amount + amountTaken;
		}
	}
	
	this.Ammo += amountTaken;
	
	return amountTaken
};

PlayerCoreStats.CanUseSpecial = function(){
	return this.HasRifle && this.Ammo > 0;
};

var Player = new Entity(new MapPresenceClass(World.CenterX, World.CenterY, 1, 0), PlayerCoreStats, null, null);

// Add entities to world
VictoryLocation.Presence.X = World.CenterX;
VictoryLocation.Presence.Y = World.CenterY;
World.EntityList.Add(VictoryLocation);

// Initial Loot/Items/Enemies
// Generate to a certain number in a spawn area
var worldItemsX1 = World.CenterX - (World.SizeX/2);
var worldItemsX2 = World.CenterX + (World.SizeX/2);

var worldItemsY1 = World.CenterY - (World.SizeY/2);
var worldItemsY2 = World.CenterY + (World.SizeY/2);

// What template to spawn and how many. ranges from a minium to a maximum
var EntitiesToSpawn = [
[GeneralPickupTemplate, Math.floor(Math.random() * 3) + 1],
[DunehoundTemplate, Math.floor(Math.random() * 3) + 1],
[AutomatonTemplate, Math.floor(Math.random() * 2) + 1],
[InvBoosterTemplate, Math.floor(Math.random() * 2) + 1],
[AglBoosterTemplate, Math.floor(Math.random() * 2) + 1],
[StrBoosterTemplate, Math.floor(Math.random() * 2) + 1],
[IntBoosterTemplate, Math.floor(Math.random() * 2) + 1],
[VictoryItemTemplate, 3]
];

// Spawn the entities in the region
for(var templateIndex in EntitiesToSpawn){

	var template = EntitiesToSpawn[templateIndex][0];

	var spawnCount = EntitiesToSpawn[templateIndex][1];

	for(var num = 0; num <spawnCount;num++){
	
		var newEntity = DuplicateEntity(template);
	
		newEntity.Presence.X = Math.floor(Math.random() * worldItemsX2) + worldItemsX1;
		newEntity.Presence.Y = Math.floor(Math.random() * worldItemsY2) + worldItemsY1;
		
		World.EntityList.Add(newEntity);
	}
}

// Add events to the world


// Pass a turn to prep everything
Log.push("Return the shards to the Obelisk.");
EndTurn();
commandModules[commandModules.length - 1].Display();