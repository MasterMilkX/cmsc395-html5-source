// PCG Functionality for generating the map in the game ///

const ASCII_REP = {
    "wall": "#",
    "floor": ".",
    "counter_v" : "|", // vertical counter symbol for shops
    "counter_h": "=", // horizontal counter symbol for shops
    "counter_c": "+", // counter corner symbol for shops
    "empty": " ", // empty space for unseen tiles
}

class GameData {
    constructor(w,h){
        this.map_w = w;                // map width
        this.map_h = h;                // map height
        this.font = "Fixedsys"
        this.state = "alive"

        this.reset();
    }

    reset(){
        // reset the game data to initial state
        this.mapArr = this.blankMap(); // recreate the blank map
        this.seenMap = this.blindMap();   // list of tiles known by the player
        this.addShops();
        
        this.player = new Character(this, 1, Math.floor(this.map_h/2), "@", "Player"); // reset player position
        this.player.money = 0; // reset player money (if any)
        this.player.range = 3;


        this.items = [];             // clear items
        this.npcs = [];             // clear npcs
        this.enemies = [];         // clear enemies

        this.addEnemies();         // re-add enemies for demo purposes
        this.addItems();

        this.status = [];          // reset status message
        this.timestep = 0;
        this.zombie_add = 20; // how often to add a new zombie (in timesteps)   
        
        this.updatePlayerView();
    }


    ///// MAP GENERATION

    // unseen map
    blindMap(){
        var m = [];
        for(var i=0; i<this.map_h; i++){
            m[i] = [];
            for(var j=0;j<this.map_w; j++){
                m[i][j] = ASCII_REP["empty"];
            }
        }
        return m; 
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

    addShops(){
        // add some shops to the map, for demo purposes
        let shop_size = {w: 9, h: 8}; // size of each shop (width x height)
        let shop_positions = [];
    
        // top shops
        for(let i=0; i<4; i++){
            // create positions for shops on the top row 
            shop_positions.push({x: 2 + i * (shop_size.w-1), y: 0}); // top row shops
        }

        // bottom shops 
        for(let i=0; i<4; i++){
            // create positions for shops on the bottom row 
            shop_positions.push({x: 2 + i * (shop_size.w-1), y: (this.map_h) - shop_size.h}); // bottom row shops
        }


        for(let pos of shop_positions){
            this.buildShop(pos, shop_size.w, shop_size.h); // build a shop at the specified position
        }
    }


    buildShop(pos, width=8, height=6){
        // the shops are subsections of 8x6 within the map
        let side = pos.y < this.map_h/2 ? "top" : "bottom"; // determine if the shop is on the top or bottom half of the map

        let shop = []
        for(let i=0; i<height; i++){
            shop[i] = []; // initialize the rows of the shop
            for(let j=0; j<width; j++){
                if (i == 0 || i == height-1 || j == 0 || j == width-1)
                    shop[i][j] = ASCII_REP["wall"]; // walls around the shop
                else
                    shop[i][j] = ASCII_REP["floor"]; // floor inside the shop
            }
        }

        // make entrance
        if(side == "top"){ // if the shop is on the top row, make an entrance at the bottom of the shop
            shop[height-1][Math.floor(width/2)] = ASCII_REP["floor"]; // entrance from the top, remove wall for entrance

        }else{
            // if the shop is on the bottom row, make an entrance at the top of the shop
            shop[0][Math.floor(width/2)] = ASCII_REP["floor"]; // entrance from the bottom, remove wall for entrance
        }
        // add counter and npc
        if(side == "top"){ // if the shop is on the top half of the map, place a counter and an NPC
            if(Math.random() < 0.5){    // left side counter
                shop[1][2] = ASCII_REP["counter_v"]; // vertical counter on the left side
                shop[2][1] = ASCII_REP["counter_h"]; 
                shop[2][2] = ASCII_REP["counter_c"]; 

            }else{
                shop[1][width-3] = ASCII_REP["counter_v"]; // counter on the right side
                shop[2][width-2] = ASCII_REP["counter_h"]; 
                shop[2][width-3] = ASCII_REP["counter_c"]; 
            }
        }else{
            // if the shop is on the bottom half of the map, place a counter and an NPC
            if(Math.random() < 0.5){    // left side counter
                shop[height-2][2] = ASCII_REP["counter_v"];
                shop[height-3][1] = ASCII_REP["counter_h"]; 
                shop[height-3][2] = ASCII_REP["counter_c"]; 
            }else{
                shop[height-2][width-3] = ASCII_REP["counter_v"]; // counter on the right side
                shop[height-3][width-2] = ASCII_REP["counter_h"]; 
                shop[height-3][width-3] = ASCII_REP["counter_c"]; 
            }
        }

        // add horizontal or vertical shelves
        if(Math.random() < 0.5){ // add horizontal shelves
            let y = side == "top" ? 3 : 2; // determine the row to place shelves based on shop position (top or bottom) 

            for(let j=2; j<width-2; j++){ // fill in shelves on the second row of the shop
                shop[y][j] = ASCII_REP["counter_h"]; // horizontal shelf on the first row of the shop
                shop[y+2][j] = ASCII_REP["counter_h"]; // add another row of shelves on the 4th row (for demo purposes)
            }
        }else{ // add vertical shelves
            let y = side == "top" ? 2 : 2; // determine the column to place shelves based on shop position (top or bottom)

            for(let j=y; j<height-2; j++){ // fill in vertical shelves on the first column of the shop
                shop[j][3] = ASCII_REP["counter_v"]; // vertical shelf on the first column of the shop
                shop[j][5] = ASCII_REP["counter_v"]; // add another vertical shelf on the last column (for demo purposes)
            }
        }


        // now place the shop on the main map array
        for(let y=pos.y; y<pos.y+height; y++){
            for(let x=pos.x; x<pos.x+width; x++){
                if (y < this.map_h && x < this.map_w) { // ensure within bounds of the main map
                    this.mapArr[y][x] = shop[y-pos.y][x-pos.x]; // copy the shop tile to the main map
                }
            }
        }
    }

    updatePlayerView(){
        
        if(!this.player) return; // no player to update view for

        // clear the current view
        let playerView = [];

        // get the player's position
        let px = this.player.x;
        let py = this.player.y;

        // define the view range (e.g. 5 tiles around the player)
        let view_range = this.player.range;

        for(let y=Math.max(0, py-view_range); y<=Math.min(this.map_h-1, py+view_range); y++){
            for(let x=Math.max(0, px-view_range); x<=Math.min(this.map_w-1, px+view_range); x++){
                if(x > -1 && y > -1 && x < this.map_w && y < this.map_h){ // ensure within bounds of the map
                    playerView.push({x:x,y:y}); // add to the player's view
                    this.seenMap[y][x] = this.mapArr[y][x]; // mark this tile as seen in the seenMap
                }
            }
        }

    }


    //// ENTITY GENERATION


    addEnemies(){
        // add some enemies to the map for demo purposes
        for(let i=0; i<5; i++){
            let pos = this.getRandPos(); // get a random position on the map
            if (!pos) { break; } // if no valid position found, break out of the loop to avoid infinite loop
            let e = new Character(this, pos.x, pos.y, "Z", "Zombie", 3); // create a goblin character
            this.enemies.push(e);
        }
        
        let pos = this.getRandPos();
        let d = new Character(this, pos.x, pos.y, "V", "Vampire", 20);
        this.enemies.push(d); 
        this.boss = d; // set the boss vampire for the game
    }

    // procedurally adds items
    addItems(){
        let all_shelves = this.shuffle(this.getShelves());

        let candies = 7;
        let pretzels = 5;
        let perfumes = 8;
        let glasses = 4;
        let moneys = Math.floor(Math.random()*5)+5

        // add everything
        for(let c=0;c<candies;c++){
            if(all_shelves.length == 0) break; // no more shelves to place items on
            let pos = all_shelves.pop(); // get a random shelf position from the shuffled list
            if(c<candies/2)
                this.addItem("candy", pos); // add a candy item to the map
            else
                this.addItem("candy")
        }

        for(let c=0;c<pretzels;c++){
            this.addItem("pretzel")
        }

        for(let c=0;c<perfumes;c++){
            if(all_shelves.length == 0) break; // no more shelves to place items on
            let pos = all_shelves.pop(); // get a random shelf position from the shuffled list
            this.addItem("perfume", pos); // add a candy item to the map
        }

        for(let c=0;c<glasses;c++){
            if(all_shelves.length == 0) break; // no more shelves to place items on
            let pos = all_shelves.pop(); // get a random shelf position from the shuffled list
            this.addItem("sunglasses", pos); // add a candy item to the map
        }

        for(let c=0;c<moneys;c++){
            this.addItem("money")
        }

        // add the key item skateboard to a shelf
        let s = all_shelves.pop();
        this.addItem("skateboard",s)


        // add the exits to the sides of the map
        this.items.push(new Item(0,Math.floor(this.map_h/2)-1,"]","exit"))
        this.items.push(new Item(0,Math.floor(this.map_h/2),"]","exit"))
        this.items.push(new Item(this.map_w-1,Math.floor(this.map_h/2)-1,"[","exit"))
        this.items.push(new Item(this.map_w-1,Math.floor(this.map_h/2),"[","exit"))


    }


    addZombie(){
        // add a new zombie to the map at a random position
        let pos = this.getRandPos(); // get a random position on the map
        if (!pos) { return; } // if no valid position found, break out of the loop to avoid infinite loop
        let e = new Character(this, pos.x, pos.y, "Z", "Zombie", 3); // create a zombie character
        this.enemies.push(e);
    }

    addItem(name, pos=null){
        if(!pos){
            pos = this.getRandPos(); // get a random position on the map if none provided
            if(!pos){return;}
        }

        this.items.push(new Item(pos.x, pos.y, PICKUPS[name], name)); // create a new item and add it to the items array

    }


    //// HELPER METHODS

    inArr(arr,e){
        
        if(arr.length == 0)
            return false; // empty array, nothing to find
        return arr.indexOf(e) !== -1; // check if the element exists in the array
    }


    // gets the rendered version of the map
    getMapRender(){    
        var rend_map = []

        // place map tiles first
        for(var i=0; i<this.map_h; i++){
            rend_map[i] = [];
            for(var j=0; j<this.map_w; j++){
                //rend_map[i][j] = this.mapArr[i][j];   // actual map
                rend_map[i][j] = this.seenMap[i][j];    // player seen map
            }
        }

        // place items on the map
        for(let item of this.items){
            if(item.show && rend_map[item.y][item.x] != ASCII_REP["empty"])
                rend_map[item.y][item.x] = item.symb; // replace the tile with the item's symbol
            
        }

        // place characters on the map (and show if within view)
        let p = this.player;
        for(let char of this.npcs){
            let dist = 0; // distance from player to character
            dist = Math.abs(p.x - char.x) + Math.abs(p.y - char.y); // Manhattan distance to the player

            if(char.show && dist <= this.player.range){
                rend_map[char.y][char.x] = char.symb; // replace the tile with the character's symbol
            }
        }
        for(let char of this.enemies){
            let dist = 0; // distance from player to character
            dist = Math.abs(p.x - char.x) + Math.abs(p.y - char.y); // Manhattan distance to the player

            if(char.show && dist <= 8){
                rend_map[char.y][char.x] = char.symb; // replace the tile with the character's symbol
            }
        }

        // player on top
        if(this.player)
            rend_map[this.player.y][this.player.x] = this.player.symb; // ensure player is on top of other tiles

        return rend_map;

    }

    // returns all shelf positions on the map for shops, if needed for item placement or other logic
    getShelves(){
        let shelves = [];
        for(let y=0; y<this.map_h; y++){
            for(let x=0; x<this.map_w; x++){
                if(this.mapArr[y][x] == ASCII_REP["counter_h"] || this.mapArr[y][x] == ASCII_REP["counter_v"]){
                    shelves.push({x:x, y:y}); // add the position of the shelf to the array
                }
            }
        }
        return shelves;

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
        for(let char of this.npcs){
            if(char.x == x && char.y == y && char.show) // find the character at this position
                return char;
        }
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




