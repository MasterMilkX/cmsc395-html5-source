extends Area2D

var BULLET_SPEED : int = 200
var BULLET_SIZE : float = 1
var SHOT_RANGE : int = -1

var first_pos : Vector2 = Vector2.ZERO
	
func ptDist():
	return sqrt((position.x-first_pos.x)**2+(position.y-first_pos.y)**2)

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _physics_process(delta: float) -> void:	# set initial position and scale
	if first_pos == Vector2.ZERO:
		first_pos = Vector2(position.x, position.y)
		scale = Vector2(BULLET_SIZE,BULLET_SIZE)
	position -= transform.y * BULLET_SPEED/BULLET_SIZE * delta
	
	# delete the bullet if at the range limit
	if SHOT_RANGE != -1 and ptDist() >= SHOT_RANGE:		
		queue_free()
	#else: #debug distance check
	#	print("%s -> %s = %.2f" % [first_pos,position,ptDist()])
	

func _on_body_entered(body: Node2D) -> void:
	if body.name == "Top":   # edge of screen
		queue_free()


func _on_area_entered(area: Area2D) -> void:
	if area.is_in_group("target") and area.is_active:   # if a target object
		area.hit()
		queue_free()
