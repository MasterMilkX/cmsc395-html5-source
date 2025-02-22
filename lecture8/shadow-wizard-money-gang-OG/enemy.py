import pygame
import utils
import math
from projectile import Projectile

from wizard import Wizard

class Enemy(Wizard):
    ''' Enemy AI class '''
    def __init__(self, game, orb_spawn, pos, wiz_color="red"):
        ''' Initialize the enemy '''
        super().__init__(game, pos, wiz_color)
        self.orb_spawn = orb_spawn   # base orb that it was spawned from

        self.move_speed *= 0.6      # move slower
        self.fire_rate *= 1.5       # shoot slower

        self.npos = self.pos.copy()   # position to move to
        self.outer_range = 300          # stop moving and shoot
        self.inner_range = 100          # shoot but move away


    def update(self):  
        ''' Update the enemy AI '''
        if not self.active:
            return
        
        # aim at the player
        self.aimAtPlayer()
        
        # shoot if within range
        if self.dist2Player() < self.inner_range:  # move away while shooting
            self.shoot()
            self.moveAway()
        elif self.dist2Player() < self.outer_range:
            self.shoot()
        else:
            self.randomWalk()


        super().update()

    def render(self):
        super().render()

        if self.game.DEBUG:
            pygame.draw.circle(self.game.screen, (255, 255, 0), (int(self.npos[0]), int(self.npos[1])), 5)


    # enemy AI
    def aimAtPlayer(self):
        ''' Aim the enemy at the player '''
        player = self.game.player
        dx = player.pos[0] - self.pos[0]
        dy = player.pos[1] - self.pos[1]

        all_angles = [0, 45, 90, 135, 180, 225, 270, 315]
        best_angle = math.degrees(math.atan2(dy, dx))

        # convert to 0-360
        best_angle = (best_angle + 360) % 360

        # find the closest angle
        d_angle = [abs(best_angle - a) for a in all_angles]
        self.arm_angle = all_angles[d_angle.index(min(d_angle))]


    def dist2Player(self):
        ''' Get the distance to the player '''
        player = self.game.player
        return utils.dist(self.pos, player.pos)


    def randomWalk(self):
        ''' Move to a random nearby position until reached '''
        if utils.dist(self.pos, self.npos) < 5:
            self.npos = utils.randomNeaby(self.pos, [self.game.WIN_WIDTH-32, self.game.WIN_HEIGHT-32], 50)
        
        hor = 0
        ver = 0
        if self.npos[0] < self.pos[0]:
            hor = -1
        elif self.npos[0] > self.pos[0]:
            hor = 1

        if self.npos[1] < self.pos[1]:
            ver = -1
        elif self.npos[1] > self.pos[1]:
            ver = 1
        
        self.move(hor, ver)

    def moveAway(self):
        ''' Move away from the player '''
        player = self.game.player
        dx = player.pos[0] - self.pos[0]
        dy = player.pos[1] - self.pos[1]

        hor = 0
        ver = 0
        if dx < 0:
            hor = 1
        elif dx > 0:
            hor = -1

        if dy < 0:
            ver = 1
        elif dy > 0:
            ver = -1

        self.move(hor, ver)


    def kill(self):
        ''' Destroy the enemy '''
        self.game.enemies.remove(self)
        self.orb_spawn.gang.remove(self)

