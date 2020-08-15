// Templates for Events/Entities

// Spawn the templates off map (but they won't be added directly to game world immediatly so its ok)
var AutomatonTemplate = TemplateEntity(1, new CoreStats(5,1,4, "Automaton"), function(){

	// Check distance relative to player
	dist = RangeRadius(Player, this);

	if(dist <= 1){
		// Can take a shot on the player
		// Face player
		this.Presence.Heading = World.frm_AngleBetweenEntities(Player, this);
		
		action = (Math.floor(Math.random() * 2) + 1) <= 1;
		// Attack or move
		if(action){
			// Move
			World.Move(this, GetSpeed(this.CoreStats));
			Log.push("Automaton moves towards you.");
		}else{
			
			// Attack
			attackInfo = SpecialAttack(this, Player);
			
			if(attackInfo["hit"]){
				
				damageData = attackInfo["damageData"];
			
				Log.push("Automaton hits you for " + damageData["damage"] + ".");
				
			}else{
				Log.push("Automaton shot goes wide!");	
			}
		}
	
	}else{
		// To far from player, wander
		if(World.Move(this, GetSpeed(this.CoreStats)) == 0){
			// Change heading as we have hit a wall
			this.Presence.Heading = (this.Presence.Heading + 45) % 360;
		}
	}

	return this.CoreStats.HP > 0;

}, null);

var DunehoundTemplate = TemplateEntity(1, new CoreStats(2,3,1, "Dunehound"), function(){
	
	// Check distance relative to player
	dist = RangeRadius(Player, this);

	if(dist <= 1){
		// Can see player
		// Attack or move or flee
		outcome = (Math.floor(Math.random() * 2)) <= 1;
			
		if(outcome && dist <= 0){
			attackInfo = DefaultAttack(this, Player);
				
			if(attackInfo["hit"]){
				
				damageData = attackInfo["damageData"];
				
				Log.push("Dunehound hits you for " + damageData["damage"] + ".");
				
			}else{
				Log.push("Dunehound misses!");	
			}
				
		}else{
			
			// Flee or head towards player
			outcome = (Math.floor(Math.random() * 2)) <= 1;
			
			if(outcome && this.HP <= 0.5*this.MaxHP){
				// Flee away from player
				this.Presence.Heading = (this.Presence.Heading + 180) % 360;
				Log.push("Dunehound flees!");	
			}else{
				// Move towards player
				this.Presence.Heading = World.frm_AngleBetweenEntities(Player, this);
				Log.push("Dunehound moves towards you!");	
			}
			
			World.Move(this, GetSpeed(this.CoreStats));

		}
	
	
	}else{
		// To far from player, wander
		if(World.Move(this, GetSpeed(this.CoreStats)) == 0){
			// Change heading as we have hit a wall
			this.Presence.Heading = (this.Presence.Heading + 45) % 360;
		}
	}
	
	return this.CoreStats.HP > 0;
	
}, null);

var GeneralPickupTemplate = TemplateEntity(1, new CoreStats(null,null,null, "Pile of junk"), null, function(){
	
	if(RangeRadius(Player, this) <= 0){
		
		// Add item to player
		ammoCount 		= (Math.floor(Math.random() * 2) + 0);
		healingCount 	= (Math.floor(Math.random() * 2) + 0);
		
		// Ensure some item is present
		if(ammoCount <= 0 || healingCount <= 0){
			itemBump = (Math.floor(Math.random() * 2)) <= 1;
			
			if(itemBump){
				ammoCount += 1;
			}else{
				healingCount += 1;
			}
			
		}
		
		if(healingCount > 0){
			amountHealing = Player.CoreStats.ChangeHealing(healingCount);	
		
			if(amountHealing != -1){
				Log.push("Picked up " + amountHealing + " healing herbs.");
				
				// remove entity from world
				this.EntityListRef.Sub(this);
			
			}
		}
		
		if(ammoCount > 0){
			amountAmmo = Player.CoreStats.ChangeAmmo(ammoCount);	
		
			if(amountAmmo != -1){
				Log.push("Picked up " + amountAmmo + " ammo.");
				
				// remove entity from world
				this.EntityListRef.Sub(this);
			
			}
		}
	}else{
		Log.push("Too far away.");
	}
	
});

// Win item
var VictoryItemTemplate = TemplateEntity(1, new CoreStats(null, null, null, "Shard of Neij"), null, function(){
	
	if(RangeRadius(Player, this) <= 0){
		// Boost player stats
		Log.push("Picked up the shard.");
	
		Player.CoreStats.VictoryItems += 1;
	
		// remove entity from world
		this.EntityListRef.Sub(this);
	}else{
		Log.push("Too far away.");
	}
	
});

var VictoryLocation = TemplateEntity(1, new CoreStats(null, null, null, "Black Obelisk"), null, function(){
	
	if(RangeRadius(Player, this) <= 0){
		// Win if you put all the shards in
		if(Player.CoreStats.VictoryItems == 3){
			// WIN
			PlayerCoreStats.Victory = true;
			Log.push("You place all the shards.");
		}else{
			Log.push("You see three holes in the obelisk.");
		}
	}else{
		Log.push("Too far away.");
	}
}
);

// Upgrade Items
var InvBoosterTemplate 		= TemplateEntity(1, new CoreStats(null, null, null, "Cloth Bandolier"), null, function(){
	
	if(RangeRadius(Player, this) <= 0){
		// Boost player stats
		Log.push("Picked up a bandolier.");
	
		Player.CoreStats.AmmoLimit += 2;

		Player.CoreStats.HealingLimit += 1;
	
		// remove entity from world
		this.EntityListRef.Sub(this);
	}else{
		Log.push("Too far away.");
	}
	
});

// Boost Agl
var AglBoosterTemplate 		= TemplateEntity(1, new CoreStats(null, null, null, "Lizard Tail"), null, function(){
	
	if(RangeRadius(Player, this) <= 0){
	
		// Boost player stats
		Log.push("Ate a lizard tail.");
		
		Player.CoreStats.Agl += 1;
		
		// remove entity from world
		this.EntityListRef.Sub(this);
	}else{
		Log.push("Too far away.");
	}
});

// Boost Str
var StrBoosterTemplate 		= TemplateEntity(1, new CoreStats(null, null, null, "Fruit"), null, function(){
	
	if(RangeRadius(Player, this) <= 0){
	
		// Boost player stats
		Log.push("Ate the fruit.");
		
		Player.CoreStats.Str += 1;
		
		// remove entity from world
		this.EntityListRef.Sub(this);
	}else{
		Log.push("Too far away.");
	}
});

// Boost Int
var IntBoosterTemplate 		= TemplateEntity(1, new CoreStats(null, null, null, "Tome"), null, function(){
	
	if(RangeRadius(Player, this) <= 0){
		// Boost player stats
		Log.push("Analyzed the tome.");
		
		Player.CoreStats.Int += 1;
		
		// remove entity from world
		this.EntityListRef.Sub(this);
	}else{
		Log.push("Too far away.");
	}
});

// Events
var RefreshEventTemplate	= ScriptEntity(function(){
	 
	 // Enenmy Spawn Limit
	 this.Enemies = 3;
	 
	 // Item Spawn Limit
	 this.Items = 3;
	 
});
