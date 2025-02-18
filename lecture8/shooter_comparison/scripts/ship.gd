extends CharacterBody2D

var cam_limit : Rect2

@export var MOVE_SPEED : int = 100
var friction : int = MOVE_SPEED / 4
var FIRE_RATE : int = 100
var is_beam : bool = false
var bullet_size : float = 1.0
var spray : bool = false
var is_inf_bullet : bool = true
var bullet_range : float = 80

@onready var shotPt : Node2D = $ShotPt
@onready var shotside1 : Node2D = $ShotPt2
@onready var shotside2 : Node2D = $ShotPt3

var can_shoot : bool = true
@export var bullet : PackedScene


var fire_rate_keys = [KEY_1, KEY_2, KEY_3]
var bullet_size_keys = [KEY_4, KEY_5, KEY_6]
var range_keys = [KEY_7, KEY_8, KEY_9, KEY_0]


func _ready():
	set_fire_rate()

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _physics_process(delta: float) -> void:
	
	# horizontal movement
	var hor_input = Input.get_axis("left","right")
	if hor_input:
		velocity.x = MOVE_SPEED * hor_input
	else:
		velocity.x = move_toward(velocity.x, 0, friction)
		
	# vertical movement
	var ver_input = Input.get_axis("up","down")
	if ver_input:
		velocity.y = MOVE_SPEED * ver_input
	else:
		velocity.y = move_toward(velocity.y, 0, friction)
	
	# shooting action (press or hold)
	if Input.is_action_just_pressed("shoot"): 
		can_shoot = true
		shoot()
	elif(Input.is_action_pressed("shoot") and can_shoot):
		shoot()

	move_and_slide()
	
func _unhandled_key_input(input_event: InputEvent) -> void:
	if input_event is InputEventKey:
		if input_event.pressed:
			if input_event.keycode in fire_rate_keys:				# change fire rate
				change_fire_rate(input_event.keycode)
				print("New fire rate: " + str(FIRE_RATE))
			elif input_event.keycode in bullet_size_keys:			# change bullet size
				change_bullet_size(input_event.keycode)
				print("New bullet size: " + str(bullet_size))
			elif input_event.keycode in range_keys:					# change range type
				change_range_type(input_event.keycode)
				print("Range settings: inf=%s spray=%s" % [str(is_inf_bullet), str(spray)])
				


func shoot():
	if not can_shoot:
		return
	can_shoot = false
	$ShootTimeout.start()   # start shot timeout again
	
	# create the bullet
	make_bullet(shotPt)
	
	if spray:
		make_bullet(shotside1)
		make_bullet(shotside2)
	
# creates a new bullet with specific properties
func make_bullet(pt:Node2D):
	var b = bullet.instantiate()
	b.BULLET_SIZE = bullet_size
	b.SHOT_RANGE = bullet_range if not is_inf_bullet else -1
	get_tree().root.add_child(b)
	b.transform = pt.global_transform
	
		
# allow shooting (timeouts create a rate of fire)
func _on_shoot_timeout_timeout() -> void:
	can_shoot = true
	
func set_fire_rate():
	$ShootTimeout.wait_time = float(FIRE_RATE / 1000.0)

# change the fire rate
func change_fire_rate(set_btn):
	if set_btn == KEY_1:
		FIRE_RATE = 250
	elif set_btn == KEY_2:
		FIRE_RATE = 150
	elif set_btn == KEY_3:
		FIRE_RATE = 100
	
	set_fire_rate()
	
		
func change_bullet_size(set_btn):
	if set_btn == KEY_4:   #small
		bullet_size = 1.0
		is_beam = false
		set_fire_rate()
	elif set_btn == KEY_5:  #large
		bullet_size = 2.5
		is_beam = false
		set_fire_rate()
	elif set_btn == KEY_6:   #beam
		bullet_size = 1.0
		is_beam = true
		$ShootTimeout.wait_time = float(10 / 1000.0)
		
func change_range_type(set_btn):
	if set_btn == KEY_7:			# infinite range
		is_inf_bullet = true
	elif set_btn == KEY_8:			# set range
		is_inf_bullet = false		
	elif set_btn == KEY_9:			# spray shot
		spray = true
	elif set_btn == KEY_0:			# single shot
		spray = false
		
