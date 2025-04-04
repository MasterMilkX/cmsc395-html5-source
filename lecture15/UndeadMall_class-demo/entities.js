///--------- ENTITIES

const PICKUPS = {
    "perfume": "?",
    "money": "$",
    "credit card": "/",     // key item
    "pretzel": "%",
    "candy": "*",
    "skateboard": "~",	// key item
}

class Item {
	constructor(x, y, symb, name){
		this.x = x;
		this.y = y;
		this.symb = symb;
        this.name = name;
        this.show = true;	// show item on map
	}

    // todo add pickup method

    pickup(c){
        if(!this.show) return; // can't pick up if not shown

        // handle picking up the item, for now just return the name of the item
        this.show = false;	// hide the item from the map
        
        // interacting mechanic
        if(this.name == "money" && c.symb == "@"){
            // if the player picks up money, increase their money count (example logic)
            let amt = Math.floor(Math.random() * 20) + 5;	// random amount between 1 and 5 for money pickup
            c.money += amt;	// add 1 money for now
            c.game.status.push(`You pick up ${amt}!`);
        }else if(this.name == "pretzel" && c.symb == "@"){
            c.hp = Math.max(c.hp+1, 10);
            c.game.status.push(`You eat the pretzel and restore 1 HP!`);	// heal 1 hp for now
        }else if(this.name == "candy" && c.symb == "@"){
            // candy gives a random chance to increase attack for a short duration (example logic)
            let h = Math.random();
            if(h > 0.5){
                c.attack += 1;	// increase attack by 1
                c.game.status.push(`You feel energized! Your attack increases by 1.`);
            }else{
                c.game.status.push(`You eat the candy but it doesn't do much...`);
            }
        }
        
        
        else if(this.name == "skateboard" && c.symb == "@"){
            if(c.money >= 100 || c.inventory.includes("credit card")){
                c.money -= 100;	// cost 100 money to use skateboard
                c.inventory.push("skateboard");	// add skateboard to inventory
                c.game.status.push(`You bought a skateboard! Let's get out of here.`);
            }else{
                this.show = true;	// make sure it stays on the map if they can't buy it
                c.game.status.push(`You don't have enough money to buy the skateboard! You need 100 money or a credit card.`);	// not enough money
            }
        }
        else if(this.name == "credit card" && c.symb == "@"){
            // credit card allows the player to buy items without money (example logic)
            c.inventory.push("credit card");	// add credit card to inventory
            c.game.status.push(`You found a credit card! You can now buy items without money.`);
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
        this.attack = 1;
        this.move_perc = 0.3;
        this.inventory = [];	// inventory for the character, can hold items they picked up
	}

    // moves the character on the map if able
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


    interact(dir){
        // handle interaction with the character, for now just return the name of the character
        if(!this.show) return; // can't interact if not shown

        let dx = 0, dy = 0;

        if (dir == "up")
            dy = -1;
        else if (dir == "down")
            dy = 1;
        else if (dir == "left")
            dx = -1;
        else if (dir == "right")
            dx = 1;

        let ent = this.game.getEntAt(this.x + dx, this.y + dy);	// get the entity at the adjacent position
        if(ent && ent != this){
            // pick up the item
            if(ent instanceof Item){
                ent.pickup(this);	// call the pickup method on the item, passing in this character
                return true;	// exit after picking up an item
            }
            // attack the enemy
            else{
                ent.hp -= this.attack;	// reduce the enemy's hp by this character's attack value
                this.game.status.push(`You attacks ${ent.name} for ${this.attack} damage!`); // add a status message to the game
                return true;	// exit after attacking the enemy
            }
        }
        

        return false;	// return the name of the character for now
    }

    ai_step(){
        // simple AI for enemies, move towards the player if in range (example logic)
        if(!this.show) return; // don't move if not shown

        let player = this.game.player; // get the player character
        if(!player) return; // no player to follow

        let dirs = ["up", "down", "left", "right"]; // possible directions to move


        if(this.nextToPlayer()){
            // if next to the player, attack them instead of moving
            // for simplicity, just reduce player hp by this character's attack
            if (player.hp > 0) {
                let h = Math.random()
                if(h > 0.75){
                    this.game.status.push(`${this.name} misses the attack on ${player.name}!`); // 25% chance to miss
                }else{
                    player.hp -= this.attack; // reduce player's hp
                    this.game.status.push(`${this.name} attacks ${player.name} for ${this.attack} damage!`);
                }
            }
        }else if(Math.random() < this.move_perc){
            // 30% chance to move in a random direction
            let randomDir = dirs[Math.floor(Math.random() * dirs.length)];
            this.move(randomDir);
        }

        /*
        let dx = player.x - this.x;
        let dy = player.y - this.y;

        if(Math.abs(dx) > Math.abs(dy)){
            if(dx > 0)
                this.move("right");
            else
                this.move("left");
        }else{
            if(dy > 0)
                this.move("down");
            else
                this.move("up");
        }
        */
    }

    // check if adjacent to the player
    nextToPlayer(){
        if(!this.show || !this.game.player) return false; // not shown or no player to check against

        let dx = Math.abs(this.x - this.game.player.x);
        let dy = Math.abs(this.y - this.game.player.y);

        // check if adjacent (including diagonals)
        if ((dx <= 1 || dy <= 1) && !(dx == 0 && dy == 0) && (dx+dy <= 2)) {
            return true; // adjacent to the player
        }
        return false;
    }



    die(){
        if(this.hp>0){return;}

        // handle character death, for now just hide the character
        this.show = false;	// hide the character from the map
        this.hp = 0;		// set hp to 0 to indicate death
        this.game.status.push(`${this.name} has been defeated!`); // add a status message to the game

        if(this.name == "Zombie"){
            this.game.enemies = this.game.enemies.filter(e => e !== this); // remove from the enemies list if it's a zombie
            
            let d = Math.random()
            if(d < 0.25){
                this.game.addItem(this.x, this.y, "$", "money");	// drop money 25% of the time
            }else if(d < 0.5){
                this.game.addItem(this.x, this.y, "%", "pretzel");	// drop a pretzel 25% of the time
            }
        
        }else if(this.name == "Vampire"){
            this.game.addItem(this.x,this.y, "/", "credit card")
        }
    }
}