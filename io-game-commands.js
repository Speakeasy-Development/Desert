function commands_game(){

	this.Submit = function(input, command, args){

		matched = true;		
		
		//Explicits
		switch(command){
			case "status":
			case "stat":
			case "s":
				this.Status();
				break;
			case "move": 
			case "mv":
			case "m":
				// Purge Log
				Log = [];

				var moveOutcome = 0;

				// Parse move dist
				if(args.length >= 2){
								
					// Attempt to move in direction up to player speed
					
					var moveDist = parseInt(args[1]);
					
					if(moveDist < 0){
						moveDist = 0;
					}
					
					if(moveDist > GetSpeed(Player.CoreStats)){
						moveDist = GetSpeed(Player.CoreStats);
					}
					
					moveOutcome = World.Move(Player, moveDist);
					
				}else{
					moveOutcome = World.Move(Player, GetSpeed(Player.CoreStats));
				}

				if(moveOutcome == 0){
						Log.push("Cannot move further that way.");
				}

				EndTurn();
				this.Report();
				break;
			case "b":
			case "bk":
			case "back":
			case "backup":
				// Purge Log
				Log = [];

				// Parse move dist
				if(args.length >= 2){
					
					// Attempt to move in direction up to player speed
					
					var moveDist = parseInt(args[1]);
					
					if(moveDist < 0){
						moveDist = 0;
					}
					
					if(moveDist > GetSpeed(Player.CoreStats)){
						moveDist = GetSpeed(Player.CoreStats);
					}
					
					World.MoveFull(Player, moveDist, Player.Presence.Heading + 180);
					
				}else{
					World.MoveFull(Player, GetSpeed(Player.CoreStats), Player.Presence.Heading + 180);
				}

				EndTurn();
				this.Report();
				break;
			case "attack":
			case "atk":
			case "at":
			case "a":
				if(args.length >= 2){
					
					// Get target
					target = PerceptionList[parseInt(args[1])]
					
					if(RangeRadius(Player, target) <= 0){
						// In range
						// Purge Log
						Log = [];
				
						var damageData = DefaultAttack(Player, target);
						
						if(damageData == null){
							Log.push("Your attack does nothing.");
						}else{
							
							var hitBool = damageData["hit"];
							var damageAmount = damageData["damageData"]["damage"];
							var deathblow = damageData["damageData"]["deathblow"];
							var survived = damageData["damageData"]["survived"];
							
							var logString = "";
							
							if(hitBool){
								logString += "You hit " + target.CoreStats.Name + " for " + damageAmount;
								
								if(deathblow){
									
									logString += " critically,"
									
									if(survived){
										logString += " but survives!"
									}else{
										logString += " and dies.";
									}
								}
								
								
							}else{
								logString = "You missed."
							}
							
							
							Log.push(logString);
							
						}
						
						EndTurn();
				
						
					}else{
						Log.push("Out of range.");
					}
				
					this.Report();

				}else{
					// bad arg format
					writeLine("Bad Format, need target index (0-n)", 0);
				}
				break;
			case "shoot":
			case "sht":
			case "sh":
				if(Player.CoreStats.CanUseSpecial()){
					if(args.length >= 2){

						// Purge Log
						Log = [];

						// Get target
						target = PerceptionList[parseInt(args[1])]
						
						if(RangeRadius(Player, target) <= 0){
							// Get target
							var damageData = SpecialAttack(Player, target);
								
							// Use up ammo
							Player.CoreStats.ChangeAmmo(-1);
							
							if(damageData == null){
								Log.push("Your attack does nothing.");
							}else{
								
								var hitBool = damageData["hit"];
								var damageAmount = damageData["damageData"]["damage"];
								var deathblow = damageData["damageData"]["deathblow"];
								var survived = damageData["damageData"]["survived"];
								
								var logString = "";
								
								if(hitBool){
									logString += "You shot " + target.CoreStats.Name + " for " + damageAmount;
									
									if(deathblow){
										
										logString += " critically,"
										
										if(survived){
											logString += " but survives!"
										}else{
											logString += " and dies.";
										}
									}
									
									
								}else{
									logString = "You missed."
								}
							
								EndTurn();
								this.Report();				 		
							
							}
						}else{
							Log.push("Out of range.");
						}
						
					}else{
						writeLine("Bad Format, need target index (0-n)", 0);
					}
				}else{
						writeLine("Cannot use rifle.", 0);
				}
				break;
			case "interact":
			case "i":
				if(args.length >= 2){

						// Get target
						target = PerceptionList[parseInt(args[1])]
						
						if(target.InteractLogic != null){

							// Purge Log
							Log = [];

							target.InteractLogic();
							EndTurn();
							this.Report();
						}	
				}else{
					writeLine("Bad Format, need target index (0-n)", 0);
				}
				break;
			case "heal":
			case "hl":
				if(Player.CoreStats.Healing > 0 && Player.CoreStats.HP < Player.CoreStats.HPMax){
					RestoreDamage(Player, 1);
					Player.CoreStats.Healing--;
				}
				break;
			case "head":
			case "face":
			case "f":
				if(args.length >= 2){
					Player.Presence.Heading = parseInt(args[1]) % 360;
					writeLine("New Heading Set:" + Player.Presence.Heading + " degrees", 0);
				}else{
					writeLine("Need facing direction [0-359] degrees", 0);
				}
				break;
			case "log":
			case "l":
				this.Display();
				break;
			case "report":
			case "r":
				this.Report();
				break;
			case "notables":
			case "notes":
			case "note":
			case "n":
				this.Notables();
				break;
			case "help":
			case "h":
				// Print out the commands available
				
				// Informationals
				writeLineHeader("--Informational", 0);
				writeLine("help/h:Display commands", 1);
				writeLine("status/stat/s:Display stats", 2);
				writeLine("notables/notes/note/n:List notable objects in view", 3);
				writeLine("log/l:", 4);
				writeLine("report/r:", 5);
				
				// Actions
				writeLineHeader("--Actions", 6);
				writeLine("move/mv/m/back/bk/b [steps]:", 7);
				writeLine("face/head/f [facingdirection]:", 8);
				writeLine("attack/atk/at/a [target index]:", 9);
				writeLine("shoot/sht/sh [target index]:", 10);
				writeLine("interact/i [target index]: ", 11);
				writeLine("heal/hl: heal", 12);
				break;
			default:
				matched = false;
				break;
		}
	};

	this.Status = function(){
		writeLineHeader("--Statistics", 0);
		writeLine("Hitpoints----(HTP):" + Player.CoreStats.HP + "/" + Player.CoreStats.MaxHP, 1);
		writeLine("Strength-----(STR):" + Player.CoreStats.Str, 2);
		writeLine("Agility------(AGL):" + Player.CoreStats.Agl, 3);
		writeLine("Intelligence-(INT):" + Player.CoreStats.Int, 4);

		writeLineHeader("--Inventory", 12);
		writeLine("Rifle Cartridges----(Ammo):" + Player.CoreStats.Ammo + "/" + Player.CoreStats.AmmoLimit, 13);
		writeLine("Healing Herbs-------(Heal):" + Player.CoreStats.Healing + "/" + Player.CoreStats.HealingLimit, 14);
		writeLine("Shard of Neij------(Shard):" + Player.CoreStats.VictoryItems + "/" + 3, 15);
	};
	
	this.Notables = function(){
		writeLineHeader("--Notables(" + PerceptionList.length + "/" + rowCount +")", 0);
		
		// Sort the list, by taking distance to the player
		PerceptionList.sort(function(a, b) {return RangeRadius(Player, a) - RangeRadius(Player, b)});

		var i = 0;

		for(; i< PerceptionList.length;i++){
			var entity = PerceptionList[i];

			// Display info relative to the distance the entity is to the player, and where in that distance
			rangeRadius = RangeRadius(Player, entity);
			
			// Index, Distance, Angle, Name, HP
			var baseLogLine = "[" + i + "] " + Math.ceil(World.frm_Distance(Player, entity)) + "m at " + Math.abs(Math.ceil(World.frm_AngleBetweenEntities(entity, Player))) + "°";

			if(rangeRadius >= 2){
				// Far away
				baseLogLine += " ???";
			}
			
			if(rangeRadius <= 1){
				// visible
				baseLogLine += " " + entity.CoreStats.Name;
			}

			if(rangeRadius <= 0 && entity.CoreStats != null && entity.CoreStats.Str != null){
				// close up
				baseLogLine += " HP:" + entity.CoreStats.HP + "/" + entity.CoreStats.MaxHP;
			}

			writeLine(baseLogLine, i + 1);
		}
	};

	this.Report = function(){

		// Display the player stats
		writeLineHeader("--Stats(abv)", 0);
		writeLine("HTP:" + Player.CoreStats.HP + "/" + N + " AMMO:" + Player.CoreStats.Ammo + "/" + Player.CoreStats.AmmoLimit + " HEALING:" + Player.CoreStats.Healing + "/" + Player.CoreStats.HealingLimit, 1);
		writeLine("Heading:" + Player.Presence.Heading + "°" , 2);
		writeLineHeader("--Notables(abv)(" + PerceptionList.length + "/6)", 3);
		
		// Sort the list, by taking distance to the player
		PerceptionList.sort(function(a, b) {return RangeRadius(Player, a) - RangeRadius(Player, b)});

		var i = 0;

		for(; i<PerceptionList.length && i<6;i++){
			var entity = PerceptionList[i];

			// Display info relative to the distance the entity is to the player, and where in that distance
			rangeRadius = RangeRadius(Player, entity);
			
			// Index, Distance, Angle, Name, HP
			var baseLogLine = "[" + i + "] " + Math.ceil(World.frm_Distance(Player, entity)) + "m at " + Math.abs(Math.ceil(World.frm_AngleBetweenEntities(entity, Player))) + "°";

			if(rangeRadius >= 2){
				// Far away
				baseLogLine += " ???";
			}
			
			if(rangeRadius <= 1){
				// visible
				baseLogLine += " " + entity.CoreStats.Name;
			}

			if(rangeRadius <= 0 && entity.CoreStats != null && entity.CoreStats.Str != null){
				// close up
				baseLogLine += " HP:" + entity.CoreStats.HP + "/" + entity.CoreStats.MaxHP;
			}


			writeLine(baseLogLine, i + 4);
		}
		
		// Write the log
		writeLineHeader("--Log(abv)(" + Log.length + "/8)", i + 4);

		for(var j = 0; j<Log.length;j++){
			writeLine(Log[j], i + j + 5);
		}
			
	};
		
	this.Display = function(){
		writeLineHeader("--Log(" + Log.length + "/" + rowCount + ")", 0);

		for(var i = 0; i<Log.length;i++){
			writeLine(Log[i], i + 1);
		}
	};

}