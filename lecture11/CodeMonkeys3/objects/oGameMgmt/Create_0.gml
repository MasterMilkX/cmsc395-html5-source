money = 0
monkeys = ds_list_create()

monkey_spr = [sSeniorDev,sAIIntern,sAISenior]


function random_position() {
    var pos = ds_map_create();  // Create a new ds_map to store the coordinates
    pos[? "x"] = irandom_range(64, 800);  // Generate a random x between 64 and 800
    pos[? "y"] = irandom_range(48, 564);  // Generate a random y between 48 and 564
    return pos;  // Return the map containing the random coordinates
}

function addMonkey(){
	pos = random_position()
	monkey = instance_create_layer(pos[? "x"],pos[? "y"],"Instances",oMonkey)
	ds_list_add(monkeys,monkey)
}

/// @function shuffle_ds_list(list_id)
/// @description Shuffles the elements of a ds_list
/// @param {ds_list} list_id - The ID of the list to shuffle

function shuffle_ds_list(list_id) {
    var i = ds_list_size(list_id);
    while (--i > 0) {
        var j = irandom(i);  // Get a random index from 0 to i
        var temp = ds_list_find_value(list_id, i);  // Temporarily store the current element
        ds_list_replace(list_id, i, ds_list_find_value(list_id, j));  // Swap elements
        ds_list_replace(list_id, j, temp);  // Complete the swap
    }
}


function upgradeMonkeys(){
	// pick a random monkey to upgrade
	shuffle_ds_list(monkeys)
	
	// find a monkey to upgrade
	for(i=0;i<ds_list_size(monkeys);i++){
		mon = monkeys[| i]
		if mon.level == 3{
			continue
		}else{
			mon.level += 1
			mon.code_rate -= 0.5
			mon.makeMoney *= 5
			mon.sprite_index = monkey_spr[mon.level-2]
			break
		}
	}
	
}