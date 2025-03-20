// Inherit the parent event
event_inherited();

text = "Upgrade ($100)"

btn_callback = function(){
	if oGameMgmt.money >= 100{
		oGameMgmt.money -= 100
		show_debug_message("supa moNKE")
		oGameMgmt.upgradeMonkeys()
	}
}