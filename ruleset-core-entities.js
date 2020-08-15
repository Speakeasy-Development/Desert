// Entities are the objects that populate a world, broadly furniture, NPCs, Player, items, etc.
// Entity Definition is required
function Entity(physicalPresence, coreStats, turnLogic, interactLogic){
	
	// Stats
	this.CoreStats = coreStats;

	// Map Presence
	this.Presence = physicalPresence;
		
	// ID used by system to handle explicit removals and operations
	this.EntityID = null;
	
	// Reference to the list this Entity resides in, used for manipulating other entries in list and itself.
	this.EntityListRef = null;
	
	// Turn logic, return false if you want this entity removed from the game
	this.TurnLogic = turnLogic;
	
	// Interact Logic
	this.InteractLogic = interactLogic;
	
}

// Entity Builder Methods
function TemplateEntity(size, coreStats, turnLogic, interactLogic){
	
	return new Entity( new MapPresenceClass(0, 0, size, 0), coreStats, turnLogic, interactLogic);
}

function ScriptEntity(turnLogic){
	
	return new Entity(null, null, turnLogic, null);
}

function DuplicateEntity(srcEntity){
	
	newEntity = new Entity(null, null, srcEntity.TurnLogic, srcEntity.InteractLogic);
	
	// Do shallow copies only if we need to do a copy
	if(srcEntity.Presence != null){
		newEntity.Presence = Object.assign(new Object(), srcEntity.Presence);
	}
	
	if(srcEntity.CoreStats != null){
		newEntity.CoreStats = Object.assign(new Object(), srcEntity.CoreStats)
	}
	
	return newEntity;
}

// Linked List used by various lists that require parsing editable support
function LinkedListNode(){
	this.Data;
	this.Next;
	this.Prev;
	
	this.Remove = function(){
		var prevNode = this.Prev;
		var nextNode = this.Next;

		if(prevNode != null){
			prevNode.Next = nextNode;	
		}
		
		if(nextNode != null){
			nextNode.Prev = prevNode;
		}
		
		this.Next = null;
		this.Prev = null;
	};
}

// Linked List to contain entities with allocated IDs for global reference
function LinkedList(){
	this.Head = null;
	this.Tail = this.Head;
	this.Size = 0;
	this.FreeIDs = [];
	
	this.FindEntityNode = function(entity){
		
		// Go through links looking for matching entity
		var currentNode = this.Head;
		
		while(currentNode != null){
			
			var entityID = entity.EntityID;
			
			if(entityID == currentNode.Data.EntityID){
				return currentNode;
			}		
			currentNode = currentNode.Next;
		}
		
		return null;
		
	}
	
	this.Add = function(entity){
		
		var addNode = new LinkedListNode();
		addNode.Data = entity;
		entity.EntityListRef = this;
		
		if(this.Head == null){
			
			this.Head = addNode
			
			//Update Tail
			this.Tail = this.Head;
			
		}else{
			
			this.Tail.Next = addNode;
			addNode.Prev = this.Tail;
			this.Tail = addNode;
			
		}
		
		if(this.FreeIDs.length <= 0){
			
			entity.EntityID = this.Size;
		}else{
			
			id = this.FreeIDs.pop();
			entity.EntityID = id;
		}
		
		this.Size += 1;
	};
	
	this.Sub = function(entity){
		
		// Find the node by entity ID
		listNode = this.FindEntityNode(entity)
		
		if(listNode != null){
			this.Tail = listNode.Prev;
			listNode.Remove();
			this.Size -= 1;
			this.FreeIDs.push(entity.EntityID);
			listNode.Data.EntityID = null;
		}
	
	};
}

// The space that holds entities and events
function MapPresenceClass(x, y, size, heading){
		
	// Positional coordinates
	this.X = x;
	this.Y = y;
	this.Size = size;
		
	// Directional Heading 0-359
	this.Heading = heading;
		
};

function World(sizeX, sizeY){
	
	this.SizeX = sizeX;
	this.SizeY = sizeY;
	this.CenterX = this.SizeX/2;
	this.CenterY = this.SizeY/2;
	
	// List of entities in the game world
	this.EntityList = new LinkedList();
	
	this.frm_Distance = function(srcEntity, trgEntity){
		var d = Math.pow((srcEntity.Presence.X - trgEntity.Presence.X), 2) + Math.pow((srcEntity.Presence.Y - trgEntity.Presence.Y), 2);
		d = Math.sqrt(d);

		// remove the radii of both entities
		d = d - srcEntity.Presence.Size - trgEntity.Presence.Size;

		if(d < 0){
			d = 0;
		}

		return d;
	};
	
	this.frm_AngleBetweenEntities = function(srcEntity, trgEntity){
		x1 = srcEntity.Presence.X;
		x2 = trgEntity.Presence.X;
		y1 = srcEntity.Presence.Y;
		y2 = trgEntity.Presence.Y;

		var val = Math.atan2((y1 - y2), (x1 - x2)) * 180 / Math.PI;

		if(val < 0){
			val = val + 360;
		}

		return val;
	};
	
	// Return 1 or 0 (1 = successful placement, 0 = unsuccessful placement)
	this.Place = function(entity, newX, newY){
		// Adjust the coords so they fall within the range
		
		placementOutcome = 1;
		
		if(newX > this.SizeX){
			newX = this.SizeX;
			placementOutcome = 0;
		}else if(newX < 0){
			newX = 0;
			placementOutcome = 0;
		}

		if(newY > this.SizeY){
			newY = this.SizeY;
			placementOutcome = 0;
		}else if(newY < 0){
			newY = 0;
			placementOutcome = 0;
		}

		entity.Presence.X = newX;
		entity.Presence.Y = newY;

		// Check if within collision of another object - FUTURE
		return placementOutcome;
		
	};

	// Move an entity based on Heading and speed
	this.MoveFull = function(entity, distance, direction){

		if(distance == 0){
			return 1;
		}else{
			//Calculate the new X and Y based on Heading of the entity
			var radians = direction * (Math.PI/180);
			var newX = entity.Presence.X + (distance * Math.cos(radians));
			var newY = entity.Presence.Y + (distance * Math.sin(radians));

			return this.Place(entity, newX, newY);
		}
	};

	// Move an entity based on Heading with distance
	this.Move = function(entity, distance){

		return this.MoveFull(entity, distance, entity.Presence.Heading);
	};
}
