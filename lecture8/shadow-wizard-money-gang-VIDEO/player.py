import pygame
import utils

from wizard import Wizard

class Player(Wizard):
    def __init__(self,game,wizard_color='orange'):
        super().__init__(game,[0,0],wizard_color)

        self.pos = [self.game.WIN_WIDTH//2,self.game.WIN_HEIGHT//2]


    def update(self):
        ''' Update the player '''
        super().update()

        # get in keyboard input
        keys = pygame.key.get_pressed()

        hor = 0
        vert = 0

        # horizontal movement
        if keys[pygame.K_a]:
            hor = -1
        elif keys[pygame.K_d]:
            hor = 1
        else:
            hor = 0

        # vertical movement
        if keys[pygame.K_w]:
            vert = -1
        elif keys[pygame.K_s]:
            vert = 1
        else:
            vert = 0

        self.move(hor,vert)

        # aim the arm
        self.aimArm(keys)

        # shoot
        if keys[pygame.K_LEFT] or keys[pygame.K_RIGHT] or keys[pygame.K_UP] or keys[pygame.K_DOWN]:
            self.shoot()

    
    def aimArm(self,keys):
        ''' Aim the player's arm using arrow keys '''
       

        if keys[pygame.K_LEFT] and keys[pygame.K_UP]:
            self.arm_angle = 225
        elif keys[pygame.K_LEFT] and keys[pygame.K_DOWN]:
            self.arm_angle = 135
        elif keys[pygame.K_RIGHT] and keys[pygame.K_UP]:
            self.arm_angle = 315
        elif keys[pygame.K_RIGHT] and keys[pygame.K_DOWN]:
            self.arm_angle = 45
        elif keys[pygame.K_LEFT]:
            self.arm_angle = 180
        elif keys[pygame.K_RIGHT]:
            self.arm_angle = 0
        elif keys[pygame.K_UP]:
            self.arm_angle = 270
        elif keys[pygame.K_DOWN]:
            self.arm_angle = 90
        