prog_amt = 0
prog_bar = instance_create_layer(x,y-24,"UI",oProgBar)
prog_bar.image_blend = c_yellow
prog_bar.max_width = sprite_width

level = 1
code_rate = 5
makeMoney = 5

alarm[0] = (code_rate/100) * room_speed