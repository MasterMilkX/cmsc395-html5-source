import pygame
import utils
import math
from projectile import Projectile

from wizard import Wizard

class Player(Wizard):
    ''' Player class '''

    def __init__(self, game, wiz_color="orange"):
        ''' Initialize the player '''
        super().__init__(game, [0,0], wiz_color)

        # set the player's initial position to the middle
        self.pos = [self.game.WIN_WIDTH // 2, self.game.WIN_HEIGHT // 2]


    def update(self):
        ''' Update the player's position based on input '''
        keys = pygame.key.get_pressed()
        joystick = None
        if pygame.joystick.get_count():
            joystick = pygame.joystick.Joystick(0)

        # Handle movement from the input
        ver_input = 0
        if keys[pygame.K_w] or (joystick and joystick.get_axis(1) < -0.5):
            ver_input = -1
        elif keys[pygame.K_s] or (joystick and joystick.get_axis(1) > 0.5):
            ver_input = 1
        
        hor_input = 0
        if keys[pygame.K_a] or (joystick and joystick.get_axis(0) < -0.5):
            hor_input = -1
        elif keys[pygame.K_d] or (joystick and joystick.get_axis(0) > 0.5):
            hor_input = 1

        self.move(hor_input,ver_input)

        # aim the player's arm
        self.aim(keys)

        # shoot if up, down, left, or right is held
        if keys[pygame.K_UP] or keys[pygame.K_DOWN] or keys[pygame.K_LEFT] or keys[pygame.K_RIGHT]:
            self.shoot()


        super().update()


    def aim(self, keys):
        ''' Set the player's arm angle based on input '''

        # check 2 at once first
        if keys[pygame.K_UP] and keys[pygame.K_LEFT]:
            self.arm_angle = 225
        elif keys[pygame.K_UP] and keys[pygame.K_RIGHT]:
            self.arm_angle = 315
        elif keys[pygame.K_DOWN] and keys[pygame.K_LEFT]:
            self.arm_angle = 135
        elif keys[pygame.K_DOWN] and keys[pygame.K_RIGHT]:
            self.arm_angle = 45
        elif keys[pygame.K_UP]:
            self.arm_angle = 270
        elif keys[pygame.K_DOWN]:
            self.arm_angle = 90
        elif keys[pygame.K_LEFT]:
            self.arm_angle = 180
        elif keys[pygame.K_RIGHT]:
            self.arm_angle = 0
