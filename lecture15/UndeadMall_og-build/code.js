/// MAIN GAME CODE ///


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

var keys = [];



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
		
	// show the player stats
	ctx.font = "16px monospace";
	if(GAME && GAME.player){
		ctx.fillStyle = "#ffffff";
		ctx.textAlign = "center";
		let p = GAME.player;	// reference to the player object

		let p_stats = ""
		p_stats += "[HP]: " + p.hp + " / 10      ";	// show the player's HP
		p_stats += "[Attack]: " + p.attack + "      ";	// show the player's attack power
		p_stats += "[Money]: $" + (p.money || 0) + "      ";	// show the player's money (if any)
		p_stats += "[Inventory]: " + (p.inv.length > 0 ? p.inv.join(", ") : "empty");	// show the player's inventory items

		// player info
		ctx.fillText(p_stats, canvas.width/2, canvas.height - 100);	// show player stats at the bottom of the canvas
		// status messages
		ctx.font = "14px monospace"
		for(let s=0; s < GAME.status.length; s++){	// show status messages (up to 3)
			ctx.fillStyle = "#ffffff";	// default color for status
			ctx.textAlign = "left";
			ctx.fillText("> "+ GAME.status[s], 48, canvas.height - 60 + (s*18) );	// stack messages above the HP
		}

		// erase status after showing
		GAME.status = [];	// clear the status messages after rendering them	
	}


	
	ctx.restore();
}


//////////////   UPDATE / STEP FUNCTIONS   //////////////////

function update(){
	// update the game state
	if (!GAME || GAME.state != "alive") return;	// no game data yet

	GAME.updatePlayerView();

	// control the player
	if(!GAME.player.interact(dir_map[cur_key]))	// allow the player to interact with an object in the direction of the key pressed
		GAME.player.move(dir_map[cur_key]);	// move the player in the direction of the key pressed


	// move all other characters
	for(let npc of GAME.npcs){
		npc.ai_update();	
	}

	// update enemies (if any)
	for(let enemy of GAME.enemies){
		enemy.ai_update();	// update the enemy's AI
	}

	// add a zombie gradually
	if(GAME.timestep % GAME.zombie_add == 0 && GAME.boss.show){
		GAME.addZombie();	// add a zombie to the game at random
	}

	// check if the player is dead
	if(GAME.player && GAME.player.hp <= 0){
		// player is dead, end the game
		GAME.state = "gameover";	// set the game state to gameover
		GAME.status.push("You have been defeated! Game Over.");
		GAME.status.push("Press [R] to restart the game.");	// prompt to restart the game
	}

	GAME.timestep += 1;
	updated = true;

	// redraw
	render();
}



//////////////   GAME LOOP FUNCTIONS   //////////////////

//game initialization function
function reset(){
	// TODO: Add start screen

	GAME = new GameData(map_w, map_h);	// initialize the game data structure
	
	
	GAME.reset();
	render();
}

//main game loop
function main(){
	requestAnimationFrame(main);
	canvas.focus();

	//panCamera();


}


/////////////////   HTML5 FUNCTIONS  //////////////////

//determine if valud key to press
document.body.addEventListener("keydown", function (e) {
	if(inArr(moveKeySet, e.code) && cur_key == null){
		cur_key = e.code;	// remember the current key pressed

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
