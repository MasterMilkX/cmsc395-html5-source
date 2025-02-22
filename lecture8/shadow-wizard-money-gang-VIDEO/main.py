import pygame
import time
import random

import utils
from player import Player
from orb import Orb

import asyncio


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

        # ADD INITIALIZATION CODE BELOW! #

        self.player = Player(self, self.PLAYER_COLOR)

        random.shuffle(self.OTHER_COLORS)       # shuffle the gang colors

        # create 4 different orbs in the corners
        corners = [(16,16), (self.WIN_WIDTH-48, 16), (16, self.WIN_HEIGHT-48), (self.WIN_WIDTH-48, self.WIN_HEIGHT-48)]
        for i in range(4):
            self.objs.append(Orb(self, corners[i], self.OTHER_COLORS[i]))


    def render(self):
        ''' Render the game '''

        self.screen.fill(self.BG_COLOR)  # clear the screen

        # ADD RENDER CODE BELOW! #
        self.player.render()


        # render the orbs
        for orb in self.objs:
            orb.render()

        # render the enemies
        for enemy in self.enemies:
            enemy.render()

        # render the projectiles
        for proj in self.projectiles:
            proj.render()

        
        

        pygame.display.flip()  # update the entire screen


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
            # if event.type == pygame.JOYBUTTONDOWN:
            #   print("Button pressed")

            # Handle keyboard input
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:        # QUIT THE GAME
                    self.game_on = False

                if event.key == pygame.K_F11:           # TOGGLE DEBUG MODE
                    self.DEBUG = not self.DEBUG

                if event.key == pygame.K_r:             # RESET THE GAME
                    self.reset()
        
        # ADD UPDATE CODE BELOW! #
        self.player.update()

        # update the orbs
        for orb in self.objs:
            orb.update()

        # update the enemies
        for enemy in self.enemies:
            enemy.update()

        # update the projectiles
        for proj in self.projectiles:
            proj.update()



'''TODO: change me for pygbag async later! '''
async def main():
    ''' Main function '''

    game = Game()

    game.start()
    while game.game_on:
        game.update()
        game.render()
        game.clock.tick(game.FPS)

        await asyncio.sleep(0)

asyncio.run(main())