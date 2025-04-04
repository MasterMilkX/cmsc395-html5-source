///--------- ENTITIES

const PICKUPS = {
    "perfume": "?",
    "money": "$",
    "credit card": "/",     // key item
    "pretzel": "%",
    "candy": "*",
    "skateboard": "~",	// key item
    "sunglasses": "B"
}

class Item {
	constructor(x, y, symb, name){
		this.x = x;
		this.y = y;
		this.symb = symb;
        this.name = name;
        this.show = true;	// show item on map
	}

    pickup(c){
        // remove item from map
        this.show = false;
        
        // do something to the character based on the name
        if(this.name == "perfume" && c.symb == "@"){
            c.inv.push(this.name);    // add to character's inventory if it's the player
            c.game.status.push("You found some perfume! You can use it to kill zombies.");
        }else if(this.name == "credit card" && c.symb == "@" && !c.inv.includes("Credit Card")){
            c.inv.push(this.name);
            c.game.status.push("You found a credit card! You can use it to buy the skateboard (if you find it!)");
        }else if(this.name == "money" && c.symb == "@"){
            // give money to the player
            let amt = Math.floor(Math.random() * 10) + 10;	// random amount between 1 and 20
            c.money = (c.money || 0) + amt;	// increment money for player
            c.game.status.push("You found $" + amt + "!");
        }else if(this.name == "pretzel" && c.symb == "@"){
            // heal the player if they pick up a pretzel
            c.hp = Math.min(c.hp + 1, 10);	// heal 1 hp, max 10
            c.game.status.push("You found a pretzel! You feel better.");
        }else if(this.name == "candy" && c.symb == "@"){
            // attack up
            c.attack = (c.attack || 1) + 1;	// increase attack by 1, if player
            c.game.status.push("You found some candy! Attack +1");
        }else if(this.name == "skateboard" && c.symb == "@"){
            // special item, can be used to escape zombies (or something else)
            if(c.inv.includes("credit card")){
                c.game.status.push("You used the credit card to buy the skateboard! Let's get out of here!");
                c.inv.push(this.name);	// add skateboard to inventory
            }else if(c.money >= 100){
                // if the player has enough money, let them buy the skateboard
                c.money -= 100;	// deduct the cost of the skateboard
                c.inv.push(this.name);	// add skateboard to inventory
                c.game.status.push("You bought the skateboard for $100! Let's ride!");
            }else{
                c.game.status.push("You found the skateboard but you need a credit card or $100 to buy it!");
                this.show = true;
            }
        }else if(this.name == "sunglasses" && c.symb == "@"){
            // special item, gives the player sunglasses (cool factor)
            c.range += 1;	// increase vision depth (or range) for the player, if applicable
            c.game.status.push("You found some cool sunglasses! Vision depth increased.");
        }


        // exit tile
        else if(this.name == "exit" && c.symb == "@"){
            this.show = true;
            if(c.inv.includes("skateboard")){
                c.game.status.push("You escaped the undead mall with the legendary skateboard! You win!");
                c.game.status.push("Thanks for playing! Press [R] to play again!")
                c.game.state = "win";	// set win condition in game
                c.game.player.show = false;
            }else{
                c.game.status.push("You can't leave without the skateboard!");
                // keep the player in the game, they can't leave yet
            }

        }
    }
}

class Character {
	constructor(gdat, x, y, symb, name, hp=10){
        this.game = gdat;	    // game data
		this.x = x;
		this.y = y;
		this.symb = symb;
        this.hp = hp			// player health
        this.show = true;
        this.name = name;
        this.inv = []
        this.attack = 1;
	}

    interact(dir){
        // attack or pickup an item in the direction of the character
        let dx = 0, dy = 0;

        if (dir == "up")
            dy = -1;
        else if (dir == "down")
            dy = 1;
        else if (dir == "left")
            dx = -1;
        else if (dir == "right")
            dx = 1;

        let c = this.game.getEntAt(this.x + dx, this.y + dy);	// get character at the next position
        if(c && c != this){
            // if there's a character at the next position, interact with it (e.g. attack or talk)
            if(c instanceof Item){
                // if it's an item, pickup it up
                c.pickup(this);
            }else{
                // otherwise, attack the character (if applicable)
                c.hp -= this.attack;	// simple attack, reduce hp by 1
                this.game.status.push("You attacked " + c.name + "!");
                if(c.hp <= 0){
                    c.die();	// remove character from map if dead
                }
            }
            return true;
        }
        return false;    // return false if no interaction occurred (no character or item in the direction) 
    }

    move(dir){
        let dx = 0, dy = 0;

        if (dir == "up")
            dy = -1;
        else if (dir == "down")
            dy = 1;
        else if (dir == "left")
            dx = -1;
        else if (dir == "right")
            dx = 1;

        // check if move is valid
        if(this.game.validPos(this.x + dx, this.y + dy)){
            this.x += dx;
            this.y += dy;
        }
    }

    // check if next to the player
    nextToPlayer(){
        
        if (!this.game.player) return false;	// no player to check against
        let dx = Math.abs(this.x - this.game.player.x);
        let dy = Math.abs(this.y - this.game.player.y);
        
        // check if adjacent 
        return ((dx <= 1 || dy <= 1) && (dx + dy <= 1));	// adjacent in 4 directions (up, down, left, right)
    }

    nextToEnemy(){
        if(!this.game.enemies) return false;	// no enemies to check against
        for(let enemy of this.game.enemies){
            if (!enemy.show || enemy == this) continue;	// skip dead enemies
            let dx = Math.abs(this.x - enemy.x);
            let dy = Math.abs(this.y - enemy.y);
            
            // check if adjacent 
            if ((dx <= 1 || dy <= 1) && (dx + dy <= 1)){
                return true;	// found an adjacent enemy
            }
        }
        return false;
    }

    ai_update(){
        // AI for non-player characters (simple example)
        if (!this.show) return;	// if character is not shown, do nothing

        // move randomly (for now)
        let directions = ["up", "down", "left", "right", "wait"];
        let dir = directions[Math.floor(Math.random() * directions.length)];

        if (this.nextToPlayer()) {
            // if the player has perfume get hurt
            if(this.game.player.inv.includes("perfume")){
                this.hp -= 3;	// hurt the vampire/zombie if player has perfume    
                this.game.status.push(this.name + " was hurt by the perfume! -3 HP.");
                this.game.player.inv.splice(this.game.player.inv.indexOf("perfume"), 1);	// remove the perfume from the player's inventory
            }
            else{
                // if next to player, attack the player instead of moving
                if(this.name == "Vampire"){
                    // Vampire drains more hp, special case
                    this.game.player.hp -= 2;	// vampire drains 2 hp
                    this.hp += 1;    // vampire heals itself for 1 hp when it drains blood (if applicable)
                    this.game.status.push(this.name + " drained your blood! -2 HP.");
                }else{
                    if(Math.random() < 0.5){
                        this.game.player.hp -= 1;	// normal attack, reduce player's hp by 1
                        this.game.status.push(this.name + " attacked you! -1 HP");
                    }else{
                        // miss the attack, no damage
                        this.game.status.push(this.name + " tried to attack you but missed!");
                    }
                }
            }
        }else{
            this.move(dir);	// move in a random direction
        }

        if(this.hp <= 0){
            this.die();	// remove character from map if dead
        }
    }

    die(){
        // remove character from map
        this.show = false;
        this.game.status.push(this.name + " was destroyed!");	// show defeat message in status

        // chance drop
        if(this.name == "Vampire"){
            // special case for vampire, drop a credit card when it dies
            this.game.addItem("credit card",{x:this.x,y:this.y});	// add the item to the game (e.g. drop it on the map)
            this.game.status.push(this.name + " dropped a credit card!");
        }else if(this.name == "Zombie"){
            let x = Math.random()
            if(x < 0.25){
                // 25% chance to drop a pretzel when a zombie dies
                this.game.addItem("pretzel",{x:this.x,y:this.y});	// add the item to the game (e.g. drop it on the map)
                this.game.status.push(this.name + " dropped a pretzel!");
            }
            else if(x < 0.50){
                // 25% chance to drop money when a zombie dies
                this.game.addItem("money",{x:this.x,y:this.y});	// add the item to the game (e.g. drop it on the map)
                this.game.status.push(this.name + " dropped some money!");
            }
        }

    }

}


