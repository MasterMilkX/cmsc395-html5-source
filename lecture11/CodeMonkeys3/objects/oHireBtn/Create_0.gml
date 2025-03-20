// Inherit the parent event
event_inherited();

text = "Hire ($20)"

btn_callback = function(){
	if oGameMgmt.money >= 20{
		oGameMgmt.money -= 20
		show_debug_message("+1 moNKE")
		oGameMgmt.addMonkey()
	}
}