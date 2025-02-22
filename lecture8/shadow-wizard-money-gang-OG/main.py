import pygame
import time
import random
import asyncio

import utils

from player import Player
from orb import Orb
from enemy import Enemy

class Game:
    def __init__(self):
        # pygame setup

        # constants
        self.WIN_WIDTH = 720
        self.WIN_HEIGHT = 480
        self.BG_COLOR = pygame.Color("#997ca3")
        self.FPS = 60
        self.DEBUG = False

        self.ALL_COLORS = ["red", "cyan", "green", "yellow", "purple", "orange"]
        self.PLAYER_COLOR = random.choice(self.ALL_COLORS)
        self.OTHER_COLORS = [color for color in self.ALL_COLORS if color != self.PLAYER_COLOR]

        # other variables
        self.game_on = True
        self.screen = None
        self.clock = pygame.time.Clock()
        self.play_inputs = {}
        self.dt = 0.01

        # entities
        self.player = None
        self.enemies = []
        self.projectiles = []
        self.objs = []


        # set the window title
        pygame.display.set_caption("Shadow Wizard Money Gang")


    def start(self):
        ''' Game initialization '''
        pygame.init()
        pygame.joystick.init()
        self.screen = pygame.display.set_mode((self.WIN_WIDTH, self.WIN_HEIGHT))

        if not pygame.joystick.get_count():
            print("No joysticks found")

        # set up the player
        self.player = Player(self, self.PLAYER_COLOR)


        # add 4 orbs at each corner
        corners = [[16,16], [self.WIN_WIDTH-48, 16], [16, self.WIN_HEIGHT-48], [self.WIN_WIDTH-48, self.WIN_HEIGHT-48]]
        new_colors = self.OTHER_COLORS.copy()
        random.shuffle(new_colors)
        for i in range(4):
            self.objs.append(Orb(self, corners[i], new_colors[i]))

        # add 4 enemies
        for i in range(4):
            self.objs[i].spawnWizard()


    def render(self):
        ''' Render the game '''

        self.screen.fill(self.BG_COLOR)  # clear the screen

        # draw the player
        self.player.render()

        # draw the objects
        for obj in self.objs:
            obj.render()

        # draw the enemies
        for enemy in self.enemies:
            enemy.render()

        # draw the projectiles
        for projectile in self.projectiles:
            projectile.render()

        

        pygame.display.flip()  # update the entire scree 


    def reset(self):
        ''' Reset the game '''
        self.ALL_COLORS = ["red", "cyan", "green", "yellow", "purple", "orange"]
        self.PLAYER_COLOR = random.choice(self.ALL_COLORS)
        self.OTHER_COLORS = [color for color in self.ALL_COLORS if color != self.PLAYER_COLOR]



        self.player = None
        self.enemies = []
        self.projectiles = []
        self.objs = []

        self.start()


    def update(self):
        ''' Main game loop '''
        

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.game_on = False

            # Handle joystick input
            #if event.type == pygame.JOYBUTTONDOWN:
                #print("Button pressed")

            # Handle keyboard input
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    self.game_on = False

                if event.key == pygame.K_F11:
                    self.DEBUG = not self.DEBUG

                if event.key == pygame.K_r:
                    self.reset()
        

        # update the player
        self.player.update()

        # update the objects
        for obj in self.objs:
            obj.update()

        # update the enemies
        for enemy in self.enemies:
            enemy.update()

        # update the projectiles
        for projectile in self.projectiles:
            projectile.update()



'''TODO: change me for pygbag async later! '''
async def main():
    ''' Main function '''
    

    game = Game()

    game.start()
    while game.game_on:
        game.update()
        game.render()
        game.clock.tick(60)

    await asyncio.sleep(0)

asyncio.run(main())