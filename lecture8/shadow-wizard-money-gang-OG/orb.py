import pygame
import utils
import math
import random

from enemy import Enemy

class Orb:
    def __init__(self,game,pos,color="red"):
        self.game = game
        self.pos = pos.copy()
        self.hp = 5
        self.color = color      # spawns this type of wizard enemy
        self.bbox = pygame.Rect(4, 4, 24, 24)

        self.img = pygame.image.load(f"imgs/orb.png")

        self.is_hit = False
        self.last_hit_tick = 0
        self.cooldown = 300
        self.active = True

        self.gang = []
        self.max_gang = 4
        self.last_spawn = 0

    def update(self):
        if not self.active:
            return
        
        if self.is_hit:
            if pygame.time.get_ticks() - self.last_hit_tick > self.cooldown:
                self.is_hit = False
        else:

            # spawn a wizard every n random seconds (4-10s)
            if len(self.gang) < self.max_gang and pygame.time.get_ticks() - self.last_spawn > (random.randint(4, 10)*1000):
                self.spawnWizard()
                self.last_spawn = pygame.time.get_ticks()

            # check for collisions with projectiles
            for projectile in self.game.projectiles:
                if utils.objCollided(self, projectile):
                    # lose health
                    self.hp -= 1
                    self.is_hit = True
                    self.last_hit_tick = pygame.time.get_ticks()
                    projectile.kill()

                    # check if the orb is dead from last hit
                    if self.hp <= 0:
                        self.kill()

    def render(self):
        if not self.active:
            return
        screen = self.game.screen
        if not self.is_hit or (self.is_hit and pygame.time.get_ticks() % 20 < 10):
            screen.blit(self.img, self.pos)

        if self.game.DEBUG:
            pygame.draw.rect(screen, (255, 0, 255), utils.realBBox(self), 1)

    def kill(self):
        self.active = False
        self.game.objs.remove(self)

    def nearbyPos(self):
        ''' return a random position near the orb '''
        return utils.randomNeaby(self.pos,[self.game.WIN_WIDTH-32,self.game.WIN_HEIGHT-32])

    def spawnWizard(self):
        # spawn a wizard
        wiz = Enemy(self.game, self, self.nearbyPos(), self.color)
        self.gang.append(wiz)
        self.game.enemies.append(wiz)

    


    