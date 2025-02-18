extends Area2D

@onready var regen_timer : Timer = $RegenTimer
var is_active : bool = true

func hit():
	appear(false)
	regen_timer.start()
	
func appear(is_showing:bool=true):
	$Sprite2D.visible = is_showing
	$CollisionShape2D.disabled = not is_showing
	is_active = is_showing

func _on_regen_timer_timeout() -> void:
	appear(true)
