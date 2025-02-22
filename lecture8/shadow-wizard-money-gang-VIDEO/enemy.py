import pygame
import utils

import math
import random

from wizard import Wizard

class Enemy(Wizard):
    def __init__(self,game,orb,pos,wizard_color="orange"):
        super().__init__(game,pos,wizard_color)

        self.orb = orb

        self.outer_dist = 300
        self.inner_dist = 100

        self.npos = utils.randomNeaby(self.getPlayerCenter(),[self.game.WIN_WIDTH-64,self.game.WIN_HEIGHT-64], 50)

    def update(self):
        ''' Update the enemy '''
        super().update()

        self.aimAtPlayer()

        # ai behavior
        if self.dist2Player() > self.outer_dist:        # if the player is far away, randomly walk
            self.randomWalk()
            #print("idk")
        elif self.dist2Player() > self.inner_dist:      # if the player is in the middle, just shoot
            self.shoot()
        else:                                           # otherwise, move away from the player
            self.shoot()
            self.moveAway()
            #print("run away")

        

    def aimAtPlayer(self):
        ''' Aim the enemy at the player '''
        player = self.game.player
        player_pos = player.pos

        dx = player_pos[0] - self.pos[0]
        dy = player_pos[1] - self.pos[1]

        # get the nearest angle to the player
        real_angle = math.degrees(math.atan2(dy,dx))
        real_angle %= 360       # convert to 0-360

        poss_angles = [0,45,90,135,180,225,270,315]
        angle_diffs = []
        for angle in poss_angles:
            angle_diffs.append(abs(real_angle - angle))
        
        min_diff = min(angle_diffs)
        min_index = angle_diffs.index(min_diff)
        self.arm_angle = poss_angles[min_index]


    def render(self):
        ''' Render the enemy '''
        super().render()

        if self.game.DEBUG:
            pygame.draw.circle(self.game.screen, (255, 255, 0), self.npos, 5, 1)
            pygame.draw.circle(self.game.screen, (255, 0, 255), self.pos, 3, 3)


    def kill(self):
        ''' Kill the enemy '''
        self.game.enemies.remove(self)
        self.orb.wizards.remove(self)

    def dist2Player(self):
        ''' Get the distance to the player '''
        player = self.game.player
        player_pos = player.pos

        p = self.getPlayerCenter()
        dx = player_pos[0] - p[0]
        dy = player_pos[1] - p[1]

        return math.sqrt(dx**2 + dy**2)
    

    def randomWalk(self):
        ''' Move the enemy in a random direction '''

        p = self.getPlayerCenter()
        dx = self.npos[0] - p[0]
        dy = self.npos[1] - p[1]

        hor = 0
        vert = 0

        if dx < 0:
            hor = -1
        elif dx > 0:
            hor = 1
        
        if dy < 0:
            vert = -1
        elif dy > 0:
            vert = 1
        
        self.move(hor,vert)

        if abs(dx) < 3 and abs(dy) < 3:
            self.npos = utils.randomNeaby(self.getPlayerCenter(),[self.game.WIN_WIDTH-64,self.game.WIN_HEIGHT-64], 50)

    
    def moveAway(self):
        ''' Move the enemy away from the player '''
        player = self.game.player
        player_pos = player.pos

        dx = player_pos[0] - self.pos[0]
        dy = player_pos[1] - self.pos[1]

        hor = 0
        vert = 0

        if dx < 0:
            hor = 1
        elif dx > 0:
            hor = -1
        
        if dy < 0:
            vert = 1
        elif dy > 0:
            vert = -1
        
        self.move(hor,vert)