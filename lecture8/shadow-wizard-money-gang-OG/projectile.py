import pygame
import utils
import math

class Projectile:
    def __init__(self,game,pos,angle,owner=None,money_type=0):
        self.game = game
        self.pos = pos.copy()
        self.angle = angle
        self.money_img = utils.image_at(
            pygame.image.load(f"imgs/money_bullet.png"), 
            (money_type*16, 0, 16, 16))
        self.bbox = pygame.Rect(2, 2, 12, 12)
        self.speed = 10
        self.owner = owner

        # Add the projectile to the game's projectile list
        self.game.projectiles.append(self)

    def update(self):
        # Move the projectile
        WIDTH, HEIGHT = self.game.WIN_WIDTH, self.game.WIN_HEIGHT

        self.pos[0] += self.speed * math.cos(math.radians(self.angle))
        self.pos[1] += self.speed * math.sin(math.radians(self.angle))

        # Remove projectile if it goes off screen
        if self.pos[0] < 0 or self.pos[0] > WIDTH or self.pos[1] < 0 or self.pos[1] > HEIGHT:
            self.kill()

    def render(self):
        # Draw the projectile
        screen = self.game.screen

        # rotate the image
        rotated_img = pygame.transform.rotate(self.money_img, -self.angle-90)

        screen.blit(rotated_img, (self.pos[0], self.pos[1]))

        if self.game.DEBUG:
            pygame.draw.rect(screen, (0, 0, 0),  utils.realBBox(self), 1)

        #pygame.draw.circle(screen, (255, 255, 255), (int(self.pos[0]), int(self.pos[1])), 5)
    
    # destroy the projectile
    def kill(self):
        self.game.projectiles.remove(self)
