import pygame
import utils
import math
from projectile import Projectile


class Wizard:
    ''' General wizard character class '''
    def __init__(self, game, pos, wiz_color="red"):
        ''' Initialize the player '''
        self.game = game   # of the Game class (from main.py)

        # general properties
        self.pos = pos
        self.vel = [0,0]

        self.arm_angle = 0
        self.arm_off = [16,17]
        self.arm_radius = 16

        self.fire_rate = 0.1
        self.fire_timer = 0
        self.can_fire = True
        
        self.color = wiz_color
        self.bbox = pygame.Rect(8, 10, 16, 18)
        self.move_speed = 2.5

        self.is_hit = False
        self.last_hit_tick = 0
        self.cooldown = 100
        self.hp = 5
        self.active = True

        self.npos = self.pos.copy()

        # setup the sprite
        self.spr = pygame.image.load(f"imgs/wizard_{self.color}.png")
        self.body = utils.image_at(self.spr, (32, 0, 32, 32))
        self.arm_left = utils.image_at(self.spr, (0, 0, 32, 32))
        self.arm_right = utils.image_at(self.spr, (60, 0, 32, 32))


    def update(self):
        # hit cooldown
        if self.is_hit and pygame.time.get_ticks() - self.last_hit_tick > self.cooldown:
            self.is_hit = False

        # update the fire rate
        if not self.can_fire:
            #print(f"fire_timer: {self.fire_timer}")
            self.fire_timer += self.game.dt
            if self.fire_timer >= self.fire_rate:
                self.can_fire = True
                self.fire_timer = 0

        # check if the enemy was hit
        for projectile in self.game.projectiles:
            if utils.objCollided(self, projectile) and projectile.owner != self:
                # lose health
                self.hp -= 1
                self.is_hit = True
                self.last_hit_tick = pygame.time.get_ticks()
                projectile.kill()

                # check if the enemy is dead from last hit
                if self.hp <= 0:
                    self.kill()

    def render(self):
        ''' Render the enemy to the screen '''
        screen = self.game.screen

        # draw a black shadow under the enemy
        pc = self.pos.copy()
        pygame.draw.ellipse(screen, (0, 0, 0), pygame.Rect(pc[0]+4, pc[1]+30, 24, 6))

        # draw the enemy
        if not self.is_hit or (self.is_hit and pygame.time.get_ticks() % 20 < 10):
            # draw ordering (based on angle)
            if self.arm_angle >= 180:
                # draw the arm first
                self.drawArm()
                # draw the sprite
                screen.blit(self.body, self.pos)
            else:
                screen.blit(self.body, self.pos)
                self.drawArm()

            

        # debug: show the bounding box
        if self.game.DEBUG:
            pygame.draw.rect(screen, (255, 0, 0), utils.offRectPos(self.bbox,self.pos), 2)
            pygame.draw.circle(screen, (0, 255, 0), self.getPlayerCenter(), 2)


    def shoot(self):
        ''' Create a new projectile '''
        if not self.can_fire:
            return

        # create the projectile
        Projectile(self.game, self.nozzPos(), self.arm_angle, self)
        self.can_fire = False

    def drawArm(self):
        ''' Draw the player's arm '''
        #which_arm = self.arm_left if self.arm_angle >= 180 else self.arm_right
        which_arm = self.arm_right

        angle_rad = math.radians(self.arm_angle)
        offset_x = math.cos(angle_rad) * self.arm_radius
        offset_y = math.sin(angle_rad) * self.arm_radius
        play_center = (self.pos[0]+self.arm_off[0]+offset_x, self.pos[1]+self.arm_off[1]+offset_y)

        rotated_arm = pygame.transform.rotate(which_arm, -self.arm_angle)
        self.game.screen.blit(rotated_arm, rotated_arm.get_rect(center=play_center).topleft)


    def kill(self):
        pass

    def aimAt(self, compass):
        ''' Aim the player at a compass direction '''
        if compass == "N":
            self.arm_angle = 90
        elif compass == "NE":
            self.arm_angle = 45
        elif compass == "E":
            self.arm_angle = 0
        elif compass == "SE":
            self.arm_angle = 315
        elif compass == "S":
            self.arm_angle = 270
        elif compass == "SW":
            self.arm_angle = 225
        elif compass == "W":
            self.arm_angle = 180
        elif compass == "NW":
            self.arm_angle = 135


    def move(self,hor,ver):

        # Handle movement from the input
        self.vel[1] = ver * self.move_speed
        self.vel[0] = hor * self.move_speed

        # Keep the wizard within screen bounds
        if self.nextPos()[0] < 0:
            self.vel[0] = 0
        if self.nextPos()[0] > self.game.WIN_WIDTH - 32:
            self.vel[0] = 0
        if self.nextPos()[1] < 0:
            self.vel[1] = 0
        if self.nextPos()[1] > self.game.WIN_HEIGHT - 32:
            self.vel[1] = 0
           
        # apply velocity (if possible)
        self.pos[0] += self.vel[0]
        self.pos[1] += self.vel[1]
    

    # ---  helper functions --- #

    
    def nextPos(self):
        ''' return the next position of the player given the current velocity '''
        return [self.pos[0]+self.vel[0], self.pos[1]+self.vel[1]]

    # def nextBBoxPos(self):
    #     ''' return the next bounding box position of the player given the current velocity '''
    #     return utils.offRectPos(self.bbox, self.nextPos())

    # def bboxPos(self):
    #     ''' return the bounding box position of the player '''
    #     return utils.offRectPos(self.bbox, self.pos)

    # def isColliding(self, other):
    #     ''' return True if the player is colliding with another object '''
    #     return self.bboxPos().colliderect(other.bboxPos())

    def getPlayerCenter(self):
        ''' return the center of the player '''
        return [self.pos[0]+16, self.pos[1]+16]

    def nozzPos(self):
        ''' return the position of the player's nozzle '''
        gp = self.getPlayerCenter()
        r = 16
        rad = math.radians(self.arm_angle)
        return [(gp[0]-8) + math.cos(rad)*r, (gp[1]-8)+math.sin(rad)*r]