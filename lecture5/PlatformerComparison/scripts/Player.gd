extends CharacterBody2D

enum CharacterType {slow, medium, fast}
@export var char_type : CharacterType = CharacterType.medium
@export var can_change : bool = false

var speed : int = 50
var jump : int = -300
var gravity : float = 9.8

@onready var spr : Sprite2D = $Sprite2D


func _ready():
	set_char_properties()

func _physics_process(delta) -> void:
	
	# fall if not on the floor or jump based on how long the button is pressed
	if not is_on_floor():										# fall to the ground
		velocity.y += gravity*100 * delta
	elif Input.is_action_just_pressed("jump"):					 # jump button pressed
		velocity.y = jump
	if Input.is_action_just_released("jump") and velocity.y < 0:  # jump button released early (short jump)
		velocity.y = velocity.y*0.7
		
	# move left and right and slow down to a stop
	var direction = Input.get_axis("left","right")
	if direction != 0:
		velocity.x = direction * speed
	else:
		velocity.x = move_toward(velocity.x, 0, speed*gravity*10)
		
	# change character movement type
	if can_change:
		if Input.is_action_just_pressed("slow"):
			char_type = CharacterType.slow
			set_char_properties()
		elif Input.is_action_just_pressed("mid"):
			char_type = CharacterType.medium
			set_char_properties()
		elif Input.is_action_just_pressed("fast"):
			char_type = CharacterType.fast
			set_char_properties()

		
	move_and_slide()   # apply physics to the character
		
	
# changes the gravity, speed, and jump properties of the character
# depending on the type set
func set_char_properties():
	if char_type == CharacterType.slow:
		speed = 150
		jump = -400
		gravity = 15
		spr.modulate = Color.BLUE
	elif char_type == CharacterType.medium:
		speed = 250
		jump = -400
		gravity = 9.8
		spr.modulate = Color.RED
	elif char_type == CharacterType.fast:
		speed = 320
		jump = -325
		gravity = 4.0
		spr.modulate = Color.YELLOW
		
	print("Change to: " + CharacterType.keys()[char_type])
