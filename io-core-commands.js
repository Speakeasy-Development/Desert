function command_core(){
	
	this.Submit = function(input, command, args){
		
		matched = true;

		//Explicits
		switch(command){
			case "reset":
				location.reload();
				break;
			default:
				matched = false;
				break;	
		}
		return matched;
	}
}
