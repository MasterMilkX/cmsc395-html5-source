/// ------------ MAIN GAME CODE -------------- ///


///---------- MAP AND cANVAS

//set up the canvas
var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
canvas.width = 960;		// assume 3:2 ratio; 32 pixel
canvas.height = 640;
var size = 24;

var GAME = null;
var updated = false;	// flag to indicate if the game state was updated
var map_w = 37;
var map_h = 20;

// symbol coloring
const COLORS = {
	"~": "#0000ff",	
	"V": "#ff0000",
	"Z": "#00ff00",	
	"$": "#f3ec00",
	"?": "#ec00f3",
	"/": "#00ffff",
	"%": "#b45e03",
	"*": "#ff9d00",
	"@": "#ffffff",	// player character
	"]": "#808080",	// exit tile
	"[": "#808080",	// door tile
}


//------- KEYS

// directionals
var upKey = "ArrowUp";     //[Up]
var leftKey = "ArrowLeft";   //[Left]
var rightKey = "ArrowRight";  //[Rigt]
var downKey = "ArrowDown";   //[Down]
var waitKey = "Space"
var moveKeySet = [upKey, leftKey, rightKey, downKey, waitKey];
var cur_key = null;

var dir_map = {
	"ArrowUp":   "up",	// move up
	"ArrowLeft": "left",	// move left
	"ArrowRight": "right",	// move right
	"ArrowDown": "down",	// move down
	"Space":     "wait"	// wait (or do nothing)
}


//////////////////    GENERIC FUNCTIONS   ///////////////


//checks if an element is in an array
function inArr(arr, e){
	if(arr.length == 0)
		return false;
	return arr.indexOf(e) !== -1
}


//////////////////  RENDER FUNCTIONS  ////////////////////

function render(){
	ctx.save();
	//ctx.translate(-camera.x, -camera.y);		//camera
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	//background
	ctx.fillStyle = "#000000";
	ctx.fillRect(0,0,canvas.width, canvas.height);
	
    // show the game screen
	if(GAME){
		var rend_map = GAME.getMapRender();	
		ctx.font = size + "px " + GAME.font;	// use monospace font for ascii art
		ctx.textAlign = "center"

		var offset = {x:48, y:48}

		for(var i=0; i<map_h; i++){
			for(var j=0; j<map_w; j++){
				let tile = rend_map[i][j];	// get the tile at this position
				ctx.fillStyle = COLORS[tile] || "#dedede";	// default color for unknown tiles (gray)

				// show the player with a highlight
				if (GAME.player && GAME.player.x == j && GAME.player.y == i) {
					ctx.fillRect(j*size+offset.x-size/2, i*size+offset.y-size*0.8, size, size);
					ctx.fillStyle = "#000000";	// reset fill for text
				}
				ctx.fillText(tile,j*size+offset.x,i*size+offset.y)
			}
		}
	}


    // TODO: draw the game stats and status messages
    if(GAME && GAME.player){
        // draw player stats
        ctx.textAlign = "center";
        ctx.fillStyle = "#ffffff";	// default text color for status messages
        ctx.font = "16px monospace";    // use a smaller font for status messages

        let p = GAME ? GAME.player : null;	// get the player object if it exists
        
        let p_stat = ""
        p_stat += "[HP]: " + p.hp + " / 10" + "        ";
        p_stat += "[Attack]: " + (p.attack || 1) + "        ";	// show attack, default to 1 if not set
        p_stat += "[Money]: " + (p.money || 0) + "        ";	// show money, default to 0 if not set
        p_stat += "[Inv]: " + (p.inventory && p.inventory.length > 0 ? p.inventory.join(", ") : "empty");	// show inventory items if any 

        ctx.fillText(p_stat, canvas.width / 2, canvas.height - 100)

        // draw status messages if any
        ctx.textAlign = "left"
        ctx.fillStyle = "#ffffff";	// default text color for status messages
        ctx.font = "16px monospace";    // use a smaller font for status messages
        for(let i=0; i<GAME.status.length; i++){
            let msg = GAME.status[i];

            // position the status messages below the player stats
            ctx.fillText(msg, 48, canvas.height - 80 + (i * 20));	// draw each status message below the previous one, with a little offset
        }

        GAME.status = []

    }

	ctx.restore();
}


//////////////   UPDATE / STEP FUNCTIONS   //////////////////

// called on each press of a key to update the game state
function update(){
    if(!GAME || GAME.state != "active") {return;}

    if(!GAME.player.interact(dir_map[cur_key]))
        GAME.player.move(dir_map[cur_key]);	// move the player based on the current key pressed

    for(let i=0; i<GAME.enemies.length; i++){
        let enemy = GAME.enemies[i];
        enemy.ai_step();	// call the AI step for each enemy to move them on the map
        enemy.die();
    }




    updated = true;
    render();
}



//////////////   GAME LOOP FUNCTIONS   //////////////////

//game initialization function
function reset(){
	GAME = new GameData(map_w, map_h);	// initialize the game data structure
	GAME.reset();
	render();
}

//main game loop
function main(){
	requestAnimationFrame(main);
	canvas.focus();
}


/////////////////   HTML5 FUNCTIONS  //////////////////

//determine if valud key to press
document.body.addEventListener("keydown", function (e) {
	if(inArr(moveKeySet, e.code) && cur_key == null){
		cur_key = e.code;	// remember the current key pressed
        update();

		if(!updated)
			update();
	}
	if(e.code == "KeyR")
		reset();
	
});

//check for key released
document.body.addEventListener("keyup", function (e) {
	if(cur_key == e.code){
		cur_key = null;	// remember the current key pressed
		updated = false;
	}
});


//prevent scrolling with the game
window.addEventListener("keydown", function(e) {
    // space and arrow keys
    if(([32, 37, 38, 39, 40].indexOf(e.code) > -1)){
        e.preventDefault();
    }
}, false);


main();
