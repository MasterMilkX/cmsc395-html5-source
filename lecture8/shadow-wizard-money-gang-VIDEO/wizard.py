import utils
import pygame
import math

from projectile import Projectile

class Wizard:
    def __init__(self, game, pos, wiz_color='orange'):
        self.game = game

        self.pos = pos
        self.vel = [0,0]
        self.move_speed = 3

        self.bbox = pygame.Rect(8,10,16,18)

        self.arm_angle = 0
        self.arm_radius = 16
        self.arm_offset = [16,17]

        self.fire_rate = 0.075
        self.last_fire = 0
        self.can_fire = True

        self.is_hit = False
        self.last_hit = 0
        self.hit_cooldown = 0.15

        self.hp = 5

        self.wiz_color = wiz_color

        self.spr = pygame.image.load(f'imgs/wizard_{self.wiz_color}.png')
        self.body = utils.image_at(self.spr, pygame.Rect(32, 0, 32, 32))
        self.arm = utils.image_at(self.spr, pygame.Rect(64, 0, 32, 32))

    def render(self):
        ''' Render the wizard '''
        screen = self.game.screen


        if not self.is_hit or (self.is_hit and self.last_hit % 0.05 < 0.025):
            if self.arm_angle >= 135:
                self.drawArm()
                self.game.screen.blit(self.body, self.pos)
            else:
                screen.blit(self.body, self.pos)
                self.drawArm()


        if self.game.DEBUG:
            pygame.draw.rect(screen, (255,0,0), utils.offRectPos(self.bbox, self.pos), 1)

   

    def update(self):
        ''' Update the wizard '''

        # check if the wizard can fire
        if not self.can_fire:
            self.last_fire += self.game.dt
            if self.last_fire >= self.fire_rate:
                self.can_fire = True
                self.last_fire = 0


        # check if the wizard is hit
        if self.is_hit:
            self.last_hit += self.game.dt
            if self.last_hit >= self.hit_cooldown:
                self.is_hit = False
                self.last_hit = 0

        # check if the wizard is dead
        if self.hp <= 0:
            self.kill()
        

        
    def move(self, hor, vert):
        ''' Move the wizard '''
        self.vel[0] = hor * self.move_speed
        self.vel[1] = vert * self.move_speed

        # check if within bounds of the screen
        np = self.nextPos()
        if np[0] < 0 or np[0] > self.game.WIN_WIDTH:
            self.vel[0] = 0
        if np[1] < 0 or np[1] > self.game.WIN_HEIGHT:
            self.vel[1] = 0

        self.pos[0] += self.vel[0]
        self.pos[1] += self.vel[1]


    def shoot(self):
        ''' Shoot a projectile from the nozzle of the wizard's arm '''
        if not self.can_fire:
            return

        # get the nozzle position
        rad_angle = math.radians(self.arm_angle)
        ax = self.arm_radius * math.cos(rad_angle)
        ay = self.arm_radius * math.sin(rad_angle)
        nozzle_pos = [self.pos[0] + self.arm_offset[0] + ax, self.pos[1] + self.arm_offset[1] + ay]

        # create a projectile
        self.game.projectiles.append(Projectile(self.game, nozzle_pos, self.arm_angle, self))

        self.can_fire = False

    def hit(self):
        ''' When the wizard gets hit '''
        if self.is_hit:
            return
        self.is_hit = True
        self.hp -= 1

    def kill(self):
        pass


    def aim(self, angle):
        ''' Aim the wizard's arm '''
        self.arm_angle = angle

    
    def drawArm(self):
        ''' Draw the wizard's arm based on the arm angle and arm radius'''
        rad_angle = math.radians(self.arm_angle)

        ax = self.arm_radius * math.cos(rad_angle)
        ay = self.arm_radius * math.sin(rad_angle)

        play_center = [self.pos[0] + self.arm_offset[0] + ax, self.pos[1] + self.arm_offset[1] + ay]

        rotated_arm = pygame.transform.rotate(self.arm, -self.arm_angle)
        self.game.screen.blit(rotated_arm, rotated_arm.get_rect(center=play_center).topleft)



    # helper functions 
    def nextPos(self):
        ''' Return the next position '''
        op = utils.offRectPos(self.bbox, self.pos)
        return [op[0] + self.vel[0], op[1] + self.vel[1]]
    

    def getPlayerCenter(self):
        ''' Return the center of the player '''
        return [self.pos[0] + 16, self.pos[1] + 16]

    def nozzlePos(self):
        ''' Return the nozzle position '''
        pcenter = self.getPlayerCenter()
        rad_angle = math.radians(self.arm_angle)
        r = 20
        return [(pcenter[0]-16) + r * math.cos(rad_angle), (pcenter[1]-8) + r * math.sin(rad_angle)]

        