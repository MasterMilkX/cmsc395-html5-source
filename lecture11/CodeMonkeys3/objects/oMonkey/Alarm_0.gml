prog_amt += 1
prog_bar.prog_amt = prog_amt

if prog_amt >= 100{
	prog_amt = 0
	prog_bar.prog_amt = prog_amt
	oGameMgmt.money += makeMoney
	
	//show_debug_message("GET MONEYS")
}

alarm[0] = (code_rate/100) * room_speed