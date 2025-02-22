import pygame
import math

# Initialize Pygame
pygame.init()

# Screen settings
WIDTH, HEIGHT = 800, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Image Rotation Around a Point")

# Load the image (make sure to replace 'image.png' with your image path)
image = pygame.image.load('imgs/orb.png')
image_rect = image.get_rect()

# Rotation settings
angle = 0  # Initial angle for rotation
radius = 32  # Distance from the rotation center

# Rotation center (the point around which we rotate)
rotation_center = (WIDTH // 2, HEIGHT // 2)

# Clock
clock = pygame.time.Clock()

# Game loop
running = True
while running:
    screen.fill((0, 0, 0))  # Fill the screen with black

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    # Calculate the new position based on angle and radius
    angle_rad = math.radians(angle)  # Convert angle to radians
    offset_x = math.cos(angle_rad) * radius
    offset_y = math.sin(angle_rad) * radius

    # Calculate the new center of the image
    new_center = (rotation_center[0] + offset_x, rotation_center[1] + offset_y)

    # Rotate the image
    rotated_image = pygame.transform.rotate(image, -angle)
    rotated_rect = rotated_image.get_rect(center=new_center)

    # Draw the rotated image
    screen.blit(rotated_image, rotated_rect.topleft)

    # Update angle for continuous rotation
    angle += 1  # Increment angle by 1 degree for continuous rotation

    pygame.display.flip()
    clock.tick(60)  # 60 frames per second

pygame.quit()
