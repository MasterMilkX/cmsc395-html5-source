import pygame
import random

def offRectPos(a,b):
    ''' a: pygame.Rect, b: tuple; return a new pygame.Rect with position offset by b '''
    return pygame.Rect(a.x+b[0], a.y+b[1], a.width, a.height)


def image_at(png, rectangle): # rectangle would be the section you want in the png
    rect = pygame.Rect(rectangle)
    image = pygame.Surface(rect.size,pygame.SRCALPHA, 32).convert_alpha()
    image.blit(png, (0, 0), rect)
    return image

def collided(a,b):
    ''' a: pygame.Rect, b: pygame.Rect; return True if a and b collide '''
    return a.colliderect(b)

def objCollided(a,b):
    ''' a: object with a bbox attribute, b: object with a bbox attribute; return True if a and b collide '''
    a_b = offRectPos(a.bbox, a.pos)
    b_b = offRectPos(b.bbox, b.pos)
    return a_b.colliderect(b_b)


def randPos(game):
    ''' return a random position within the game window '''
    return [random.randint(0, game.WIN_WIDTH), random.randint(0, game.WIN_HEIGHT)]

def realBBox(obj):
    ''' obj: object with a bbox attribute; return the bounding box with the object's position added '''
    return offRectPos(obj.bbox, obj.pos)

def randomNeaby(pos,max_dim,amt=50):
    ''' pos: list; return a random position near the given position '''
    x = pos[0] + random.randint(-amt, amt)
    y = pos[1] + random.randint(-amt, amt)
    return [min(max(0,x),max_dim[0]), min(max(0,y),max_dim[1])]


def dist(a,b):
    ''' a: list, b: list; return the distance between a and b '''
    dx = a[0] - b[0]
    dy = a[1] - b[1]
    return (dx*dx + dy*dy)**0.5