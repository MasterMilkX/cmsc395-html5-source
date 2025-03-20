prog_amt += 10
prog_bar.prog_amt = prog_amt


if prog_amt >= 100{
	prog_amt = 0
	prog_bar.prog_amt = prog_amt
	oGameMgmt.money += 10
	
	//show_debug_message("GET MONEYS")
}