// SDN Rules

// The number of "sides" on the dice, this governs much of the SDN system
var N = 6;

// Take a threshold, roll against it and success if roll <= stat
function OneSidedRoll(threshold){
	
	return (Math.floor(Math.random() * N) + 1) <= threshold;
}

// Take two seperate thresholds, roll them as one-sided then if they are the same outcome, resolve with 50/50 resolver
function TwoSidedRoll(threshold1, threshold2){
	
	t1Outcome = OneSidedRoll(threshold1);
	
	t2Outcome = OneSidedRoll(threshold2);
	
	outcome = false;
	
	if((t1Outcome && t2Outcome) || (!t1Outcome && !t2Outcome)){
		// Same outcome, 50/50 resolve
		outcome = (Math.floor(Math.random() * 2)) <= 1;
	}else{
		// Different outcome, take t1
		outcome = t1Outcome;
	}
	
	return outcome;
}

var PerceptionRadius = 75;

// The core statistics for entities, Hitpoints, Strength, etc. 
function CoreStats(strength, agility, intelligence, name){
	this.Str = strength;
	this.Agl = agility;
	this.Int = intelligence;
	
	// Max HP and initial HP is
	this.HP = N;
	this.MaxHP = N;
	
	this.Name = name;
	
	// Radius at which melee attack is available, and other details emerge of targets
	this.DetailRadius = 10;
	
	// Radius at which ranged attack is maximal, and some details of targets
	this.IdentifyRadius = function(){
		return Math.floor((this.Int / N) * PerceptionRadius);
	};
}

function GetSpeed(srcCoreStats){
	return srcCoreStats.Agl * 2;
}

// Determine where an entity lies relative t o the player
function RangeRadius(srcEntity, trgEntity){
	
	distToTrg = World.frm_Distance(srcEntity, trgEntity);
	
	//default to max
	var radii = 3;
	
	if(distToTrg <= srcEntity.CoreStats.DetailRadius){
		// Close
		radii = 0;
	}else if(distToTrg <= srcEntity.CoreStats.IdentifyRadius()){
		// in range
		radii = 1;
	}else if(distToTrg <= PerceptionRadius){
		// Far away
		radii = 2;
	}
	
	return radii;
}

// SDN rules mean that when you take damage if it is equal to your remaining HP (eg:  a killing blow) you roll str to see if you survive
function TakeDamage(srcEntity, damageAmount){
	
		var srcEntityCoreStats = srcEntity.CoreStats;
	
		// Check if stats valid
		if(srcEntityCoreStats.Str == null || srcEntityCoreStats.Agl == null || srcEntityCoreStats.Int == null){
			// Not valid, return blank
			return null;
		}
	
		var damageTaken = damageAmount;
		var deathBlow = false;
		var survivedDeathBlow = false;
	
		// Apply damage to HP
		if(srcEntityCoreStats.Str > 0){
			
			srcEntityCoreStats.HP -= damageAmount;
			
			// SD6 Rule, cheat death if damage brought you to 0 and no more
			if(srcEntityCoreStats.HP <= 0){
				
				deathBlow = true;
				
				// Only apply the rule if at 0 HP or reduced to 0 by damage
				if(srcEntityCoreStats.HP == 0){
					
					if(OneSidedRoll(srcEntityCoreStats.Str)){
						srcEntityCoreStats.HP = 1;
					}
					
					if(srcEntityCoreStats.HP >= 1){
						// Cheats destruction		
						survivedDeathBlow = true;
					}
				}
				
			}
		}

		return {"damage":damageTaken, "deathblow":deathBlow, "survived":survivedDeathBlow};
}

// Restore up to Max Hp
function RestoreDamage(srcEntity, restoreAmount){
	var srcEntityCoreStats = srcEntity.CoreStats;
	
	if(srcEntityCoreStats.Str > 0){
		
		// calculate restorable amount
		maxHP = N;
		
		var healthDelta = maxHP - srcEntityCoreStats.HP;
		
		if(restoreAmount > healthDelta){
			restoreAmount = healthDelta;
		}

		srcEntityCoreStats.HP += restoreAmount;	
	}
	
	return {"damageHealed":restoreAmount};
}

// One entity attacks another
function DefaultAttack(srcEntity, trgEntity){
	
	// Get core stats for each entity
	var srcCoreStats = srcEntity.CoreStats;
	var trgCoreStats = trgEntity.CoreStats;
	
		// Check if stats valid
	if(trgCoreStats.Str == null || trgCoreStats.Agl == null || trgCoreStats.Int == null){
		// Not valid, return blank
		return null;
	}
	
	var damageData = null;
	
	// Attempt to hit target
	var hit = TwoSidedRoll(srcCoreStats.Str, trgEntity.Agl);

	if(hit){
		damageData = TakeDamage(trgEntity, 1);
	}
	
	return {"hit":hit, "damageData":damageData};
	
}

// One entity attacks another
function SpecialAttack(srcEntity, trgEntity){
	
	// Get core stats for each entity
	var srcCoreStats = srcEntity.CoreStats;
	var trgCoreStats = trgEntity.CoreStats;
	
	// Check if stats valid
	if(trgCoreStats.Str == null || trgCoreStats.Agl == null || trgCoreStats.Int == null){
		// Not valid, return blank
		return null;
	}
	
	
	var damageData = null;
	
	// Attempt to hit target
	var hit = TwoSidedRoll(srcCoreStats.Int, trgEntity.Agl);

	if(hit){
		damageData = TakeDamage(trgEntity, 3);
	}
	
	return {"hit":hit, "damageData":damageData};
}

// Check for Win/Loss/Continuation that occurs at end of every turn (-1 = lose, 0 = continue, 1 = win)
function GameConditionCheck(){
	// Lose/Win condition checks
	
	cond = 0;
	
	// Lose, player has died
	if(Player.CoreStats.HP <= 0){
		Log.push("(Game Over) " + Player.CoreStats.Name + " died.");
					
		// Pop out the commands for playing, leave only the utils for restarting
		commandModules.pop();
		cond = -1;
	}else{
		// Player alive, check others
		if(PlayerCoreStats.Victory){
			Log.push("(Game Over) " + Player.CoreStats.Name + " returned all the shards.");
			
			commandModules.pop();
			cond = 1;
		}
	}
		
	return cond;
}

// Global Turn variable
var CurrentGlobalTurn = 0;
var CyclicalTurn = 0;
var CycleLength = 24;

// Entities in view of the player
var PerceptionList = [];
	
function EndTurn(){
				
	// Empty the perception list
	PerceptionList = [];
	
	// Run player Turn logic outside of the regular loop, could be added into the loop in future
	if(Player.TurnLogic != null){
		Player.TurnLogic();
	}

	var currentNode = World.EntityList.Head;

	while(currentNode != null){

		entity = currentNode.Data;
		
		console.log("turn - [" + CurrentGlobalTurn + "] - entity [" + entity.CoreStats.Name + "] [" + entity.EntityID + "] X:" + entity.Presence.X + " Y:" + entity.Presence.Y );
		
		if(entity != null){
			
			// Check if entity has physical presence
			if(entity.Presence != null){
				// Check if entity is near enough to player
				var entityDistanceToPlayer = World.frm_Distance(Player, entity);

				if(entityDistanceToPlayer <= PerceptionRadius){
					// Within perception
					PerceptionList.push(entity);

				}
			}

			if(entity.TurnLogic != null ){
				
				if(entity.TurnLogic() == false){
					// Remove from world if false
					World.EntityList.Sub(entity);
				}
			}
		
			// Lose/Win condition checks
			if(GameConditionCheck() != 0){
				// No need to let rest run
				break;
			}

		}
		
		currentNode = currentNode.Next;
		
	}// End of For
	
	// Increment Turn
	CurrentGlobalTurn++;
	CyclicalTurn = (CyclicalTurn + 1) % CycleLength;

	console.log("Current Turn:" + CurrentGlobalTurn + " | Cycle Turn:" + CyclicalTurn);
}