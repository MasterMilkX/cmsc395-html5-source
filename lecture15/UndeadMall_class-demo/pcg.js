//// ----------- PCG CODE FOR LEVEL GENERATION 

const ASCII_REP = {
    "wall": "#",
    "floor": ".",
    "counter_v" : "|", // vertical counter symbol for shops
    "counter_h": "=", // horizontal counter symbol for shops
    "counter_c": "+", // counter corner symbol for shops
    "empty": " ", // empty space for unseen tiles
}

const Rooms = {
    "room1": [["#", "#", "#", "#", "#", "#", "#", "#", "#"],
              ["#", ".", ".", ".", ".", ".", ".", ".", "#"],
              ["#", ".", ".", ".", ".", ".", ".", ".", "#"],
              ["#", ".", ".", ".", ".", ".", ".", ".", "#"],
              ["#", ".", ".", ".", ".", ".", ".", ".", "#"],
              ["#", ".", ".", ".", ".", ".", ".", ".", "#"],
              ["#", "#", "#", "#" ,"#", "#", "#", "#", "#"]],

    "room2": [["#", "#", "#", "#", "#", "#", "#", "#", "#"],
              ["#", ".", ".", ".", ".", ".", ".", ".", "#"],
              ["#", ".", "|", ".", "|", ".", "|", ".", "#"],
              ["#", ".", "|", ".", "|", ".", "|", ".", "#"],
              ["#", ".", "|", ".", "|", ".", "|", ".", "#"],
              ["#", ".", ".", ".", ".", ".", ".", ".", "#"],
              ["#", "#", "#", "#" ,"#", "#", "#", "#", "#"]],

    "room3": [["#", "#", "#", "#", "#", "#", "#", "#", "#"],
              ["#", ".", ".", ".", ".", ".", ".", ".", "#"],
              ["#", ".", "=", "=", "=", "=", "=", ".", "#"],
              ["#", ".", ".", ".", ".", ".", ".", ".", "#"],
              ["#", ".", "=", "=", "=", "=", "=", ".", "#"],
              ["#", ".", ".", ".", ".", ".", ".", ".", "#"],
              ["#", "#", "#", "#" ,"#", "#", "#", "#", "#"]],

    "room4": [["#", "#", "#", "#", "#", "#", "#", "#", "#"],
              ["#", ".", ".", ".", ".", ".", ".", ".", "#"],
              ["#", ".", "+", "=", "=", "=", "+", ".", "#"],
              ["#", ".", "|", ".", ".", ".", "|", ".", "#"],
              ["#", ".", "+", "=", ".", "=", "+", ".", "#"],
              ["#", ".", ".", ".", ".", ".", ".", ".", "#"],
              ["#", "#", "#", "#" ,"#", "#", "#", "#", "#"]],

    "room5": [["#", "#", "#", "#", "#", "#", "#", "#", "#"],
              ["#", ".", ".", ".", ".", ".", ".", ".", "#"],
              ["#", ".", ".", ".", "|", ".", ".", ".", "#"],
              ["#", ".", "=", "=", "+", "=", "=", ".", "#"],
              ["#", ".", ".", ".", "|", ".", ".", ".", "#"],
              ["#", ".", ".", ".", ".", ".", ".", ".", "#"],
              ["#", "#", "#", "#" ,"#", "#", "#", "#", "#"]],

    "room6": [["#", "#", "#", "#", "#", "#", "#", "#", "#"],
              ["#", ".", ".", ".", ".", ".", ".", ".", "#"],
              ["#", ".", "+", ".", "+", ".", "+", ".", "#"],
              ["#", ".", ".", ".", ".", ".", ".", ".", "#"],
              ["#", ".", "+", ".", "+", ".", "+", ".", "#"],
              ["#", ".", ".", ".", ".", ".", ".", ".", "#"],
              ["#", "#", "#", "#" ,"#", "#", "#", "#", "#"]]
}






class GameData {
    constructor(w,h){
        this.map_w = w;                // map width
        this.map_h = h;                // map height
        this.font = "Arial"
        this.state = "active"

    }

    reset(){
        // reset the game data to initial state
        this.mapArr = this.blankMap(); // recreate the blank map
        this.addStores()

        this.player = new Character(this, 1, Math.floor(this.map_h/2), "@", "Milk"); // reset player position
        this.player.money = 0; // reset player money (if any)
        //this.player.range = 3;

        this.items = [];           // clear items
        this.enemies = [];         // clear enemies

        this.addEnemies();     // add zombies to the map (if any)
        this.addItems();          // add items to the map (if any)

        this.status = [];          // reset status message
        

    }

    // creates an empty map with walls and floors
    blankMap(){
        var m = [];
        for(var i=0; i<this.map_h; i++){
            m[i] = [];
            for(var j=0; j<this.map_w; j++){
                if (i == 0 || i == this.map_h-1 || j == 0 || j == this.map_w-1)
                    m[i][j] = ASCII_REP["wall"];
                else
                    m[i][j] = ASCII_REP["floor"];
            }
        }
        return m;
    }

    addStores(){
        let all_stores = Object.keys(Rooms); // get all available store types (room templates)
        // add 4 stores to the top half of the map
        for(var i=0;i<4;i++){
            // randomly pick a pre-set store
            let store = Rooms[all_stores[Math.floor(Math.random() * all_stores.length)]]; // pick a random room template

            this.buildStore(store, {x:2+(i*8),y:0}); // build the store at a random position on the map
        }

        for(var i=0;i<4;i++){
            // randomly pick a pre-set store
            let store = Rooms[all_stores[Math.floor(Math.random() * all_stores.length)]]; // pick a random room template

            this.buildStore(store, {x:2+(i*8),y:this.map_h-7},false); // build the store at a random position on the map
        }

    }

    // adds a preset design to the mapArr
    buildStore(s, pos, top=true){
        for(var y=0;y<s.length; y++){
            for(var x=0;x<s[y].length; x++){
                if(pos.y + y < this.map_h && pos.x + x < this.map_w){ // ensure within bounds
                    let tile = s[y][x];
                    this.mapArr[pos.y + y][pos.x + x] = tile; // set the tile in the map array
                }
            }
        }

        // add a door
        if(top){
            // add door on the bottom of the store (for top stores)
            this.mapArr[pos.y + s.length-1][pos.x + 4] = ASCII_REP["floor"]; // door at the bottom center of the store
        }else{
            // add door on the top of the store (for bottom stores)
            this.mapArr[pos.y][pos.x + 4] = ASCII_REP["floor"]; // door at the top center of the store
        }
    }


    addEnemies(){
        // add zombies to random positions on the map (excluding player position)
        let max_zombies = 5;

        for(let i=0; i<max_zombies; i++){
            let pos = this.getRandPos();
            if(pos){
                let zombie = new Character(this, pos.x, pos.y, "Z", "Zombie", 3); // create a zombie character
                this.enemies.push(zombie); // add to enemies array
            }
        }

        // add the vampire boss
        let p = this.getRandPos();
        var v = new Character(this, p.x, p.y, "V", "Vampire", 20); // create a vampire character with higher stats
        v.move_perc = 0.8
        v.attack = 2; // higher attack for the boss
        this.enemies.push(v); // add to enemies array
    }

    addItems(){
        var moneys = 7;
        var pretzels = 3; // number of pretzels to add
        var candy = 10;


        for(var i=0;i<moneys;i++){
            let pos = this.getRandPos(); // get a random position on the map
            if(pos){
                this.addItem(pos.x, pos.y, "$", "money"); // add a money item at the random position
            }
        }


        for(var i=0;i<pretzels;i++){
            let pos = this.getRandPos(); // get a random position on the map
            if(pos){
                this.addItem(pos.x, pos.y, "%", "pretzel"); // add a pretzel item at the random position
            }
        }

        for(var i=0;i<candy;i++){
            let pos = this.getRandPos(); // get a random position on the map
            if(pos){
                this.addItem(pos.x, pos.y, "*", "candy"); // add a candy item at the random position
            }
        }

        // add the skateboard to the shelf
        let shelves = this.shuffle(this.getShelves())
        if(shelves.length > 0){
            // place skateboard on a random shelf
            let pos = shelves[0]; // take the first shelf position after shuffling
            this.addItem(pos.x, pos.y, PICKUPS["skateboard"], "skateboard"); // add a skateboard item at the shelf position
        }

    }

    addItem(x,y,symb,name){
        let item = new Item(x, y, symb, name); // create a money item
        this.items.push(item); // add to items array
    }


    getShelves(){
        // returns the positions of shelves in the map for placing items (for shops)
        let shelves = [];
        for(let i=0; i<this.map_h; i++){
            for(let j=0; j<this.map_w; j++){
                if(this.mapArr[i][j] == ASCII_REP["counter_v"] || this.mapArr[i][j] == ASCII_REP["counter_h"] || this.mapArr[i][j] == ASCII_REP["counter_c"]){
                    shelves.push({x:j,y:i}); // add shelf positions to the array
                }
            }
        }
        return shelves;
    }

    shuffle(arr){
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]]; // swap elements
        }
        return arr;
    }



    // gets the rendered version of the map
    getMapRender(){    
        var rend_map = []

        // place map tiles first
        for(var i=0; i<this.map_h; i++){
            rend_map[i] = [];
            for(var j=0; j<this.map_w; j++){
                rend_map[i][j] = this.mapArr[i][j];   // actual map
            }
        }

        // TODO: add items and enemy renders here
        for(let item of this.items){
            if(item.show){ // only show if the item is visible
                rend_map[item.y][item.x] = item.symb; // place item symbol on the map
            }
        }

        // render enemies
        for(let char of this.enemies){
            if(char.show){ // only show if the character is visible
                rend_map[char.y][char.x] = char.symb; // place enemy symbol on the map
            }
        }

        // player on top
        if(this.player)
            rend_map[this.player.y][this.player.x] = this.player.symb; // ensure player is on top of other tiles

        return rend_map;

    }



    //// HELPER METHODS

    inArr(arr,e){
        
        if(arr.length == 0)
            return false; // empty array, nothing to find
        return arr.indexOf(e) !== -1; // check if the element exists in the array
    }


    // check if position is valid
    validPos(x, y){
        if (x < 0 || x >= this.map_w || y < 0 || y >= this.map_h)
            return false; // out of bounds
        if (this.mapArr[y][x] != ASCII_REP['floor'])
            return false; // not a floor tile
        if (this.getEntAt(x, y) != null)	
            return false; // occupied by another character

        return true;
    }

    // returns a random open floor position
    getRandPos(){
        let x, y, i=0;
        do{
            x = Math.floor(Math.random() * (this.map_w - 2)) + 1; // random x within bounds
            y = Math.floor(Math.random() * (this.map_h - 2)) + 1; // random y within bounds
            i += 1
        }while(!this.validPos(x,y) && i < 100); // ensure it's a floor tile

        
        return i < 100 ? {x:x,y:y} : null; // return the random position
    }


    // return the entity at a specific position (x,y)
    getEntAt(x,y){
        for(let char of this.enemies){
            if(char.x == x && char.y == y && char.show) // find the enemy at this position
                return char;
        }
        for(let item of this.items){
            if(item.x == x && item.y == y && item.show) // find the item at this position
                return item;
        }

        if(this.player && this.player.x == x && this.player.y == y && this.player.show) // check if player is at this position
            return this.player;
        return null;
    }

    // shuffles an array
    shuffle(arr){
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]]; // swap elements
        }
        return arr;
    }


}