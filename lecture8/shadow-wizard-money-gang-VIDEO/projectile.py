import utils
import pygame
import math

class Projectile:
    def __init__(self, game, pos, angle, owner=None):
        self.game = game
        self.pos = pos
        self.angle = angle
        self.owner = owner

        self.speed = 10
        self.bbox = pygame.Rect(2,2,12,12)

        self.img = utils.image_at(pygame.image.load("imgs/money_bullet.png"),pygame.Rect(0,0,16,16))


    def render(self):
        ''' Render the projectile '''
        screen = self.game.screen
        
        # rotate the projectile based on the angle
        img = pygame.transform.rotate(self.img, (-self.angle-90))
        screen.blit(img, self.pos)

        if self.game.DEBUG:
            pygame.draw.rect(screen, (0,0,0), utils.offRectPos(self.bbox, self.pos), 1)


    def update(self):
        ''' Update the projectile '''
        self.pos[0] += self.speed * math.cos(math.radians(self.angle))
        self.pos[1] += self.speed * math.sin(math.radians(self.angle))

        # check for collisions
        all_objs = self.game.objs
        for obj in all_objs:
            if utils.objCollided(self, obj):
                if obj != self.owner:
                    obj.hit()
                    self.kill()
                    break

        # check for collisions with the player
        if self.owner != self.game.player and utils.objCollided(self, self.game.player):
            self.game.player.hit()
            self.kill()

        # check for collisions with the enemies
        for enemy in self.game.enemies:
            if self.owner != enemy and utils.objCollided(self, enemy):
                enemy.hit()
                self.kill()
        

        # check if out of bounds
        if self.pos[0] < 0 or self.pos[0] > self.game.WIN_WIDTH:
            self.kill()
        if self.pos[1] < 0 or self.pos[1] > self.game.WIN_HEIGHT:
            self.kill()

    def kill(self):
        ''' Kill the projectile '''
        if self in self.game.projectiles:
            self.game.projectiles.remove(self)

    