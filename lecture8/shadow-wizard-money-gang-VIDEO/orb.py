import pygame
import utils
import random

from enemy import Enemy

class Orb:
    def __init__(self,game,pos,wiz_color="orange"):
        self.game = game
        self.pos = pos
        self.wiz_color = wiz_color

        self.image = pygame.image.load("imgs/orb.png")
        self.bbox = pygame.Rect(4,4,18,18)

        self.is_hit = False
        self.last_hit = 0
        self.hit_cooldown = 0.25

        self.hp = 10

        self.max_wizards = 4
        self.wizards = []
        self.wiz_spawn = random.randint(50, 200)
        self.next_spawn = 0

    def update(self):

        # if no hp left, then destroy
        if self.hp <= 0:
            self.kill()


        # spawn a new wizard every n random seconds (3-6)
        if self.next_spawn % self.wiz_spawn == 0:
            self.add_wizard()
            self.wiz_spawn = random.randint(50, 200)
            self.next_spawn = 1
        
        self.next_spawn += 1

    
    def hit(self):
        ''' When the orb gets hit by a bullet'''
        if self.is_hit:
            return
        self.is_hit = True
        self.hp -= 1

        
    def render(self):
        ''' Render the orb '''

        if self.is_hit:
            self.last_hit += self.game.dt
            if self.last_hit >= self.hit_cooldown:
                self.is_hit = False
                self.last_hit = 0

        if not self.is_hit or (self.is_hit and self.last_hit % 0.1 < 0.05):
            self.game.screen.blit(self.image,self.pos)

        if self.game.DEBUG:
            pygame.draw.rect(self.game.screen,(0,0,255),utils.offRectPos(self.bbox,self.pos),2)

    def kill(self):
        self.game.objs.remove(self)


    def add_wizard(self):
        ''' Add a wizard to the orb '''
        w,h = self.game.WIN_WIDTH,self.game.WIN_HEIGHT

        if len(self.wizards) < self.max_wizards:
            enemy = Enemy(self.game, self, utils.randomNeaby(self.pos,[w,h]), self.wiz_color)
            self.wizards.append(enemy)
            self.game.enemies.append(enemy)
            return
            