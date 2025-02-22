import pygame
import math

# Initialize Pygame
pygame.init()

# Screen settings
WIDTH, HEIGHT = 800, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Twin Stick Shooter")

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)

# Player settings
player_radius = 20
player_speed = 5
bullet_speed = 10

# Setup clock
clock = pygame.time.Clock()

# Create player class
class Player(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.image = pygame.Surface((player_radius*2, player_radius*2), pygame.SRCALPHA)
        pygame.draw.circle(self.image, WHITE, (player_radius, player_radius), player_radius)
        self.rect = self.image.get_rect()
        self.rect.center = (WIDTH // 2, HEIGHT // 2)
        self.angle = 0  # Initial angle for shooting

    def update(self, keys):
        # Handle movement
        if keys[pygame.K_w]:
            self.rect.y -= player_speed
        if keys[pygame.K_s]:
            self.rect.y += player_speed
        if keys[pygame.K_a]:
            self.rect.x -= player_speed
        if keys[pygame.K_d]:
            self.rect.x += player_speed

        # Keep the player within screen bounds
        if self.rect.left < 0:
            self.rect.left = 0
        if self.rect.right > WIDTH:
            self.rect.right = WIDTH
        if self.rect.top < 0:
            self.rect.top = 0
        if self.rect.bottom > HEIGHT:
            self.rect.bottom = HEIGHT

    def set_angle(self, keys):
        # Set angle based on arrow keys
        if keys[pygame.K_LEFT]:
            self.angle = 180  # Left
        elif keys[pygame.K_RIGHT]:
            self.angle = 0  # Right
        elif keys[pygame.K_UP]:
            self.angle = 270  # Up
        elif keys[pygame.K_DOWN]:
            self.angle = 90  # Down

    def shoot(self):
        return Bullet(self.rect.center, self.angle)

# Create bullet class
class Bullet(pygame.sprite.Sprite):
    def __init__(self, position, angle):
        super().__init__()
        self.image = pygame.Surface((10, 5))
        self.image.fill(RED)
        self.rect = self.image.get_rect()
        self.rect.center = position
        self.angle = angle
        self.velocity = pygame.math.Vector2(bullet_speed, 0).rotate(angle)

    def update(self,keys):
        self.rect.x += self.velocity.x
        self.rect.y += self.velocity.y

        # Remove bullet if it goes off screen
        if self.rect.right < 0 or self.rect.left > WIDTH or self.rect.top < 0 or self.rect.bottom > HEIGHT:
            self.kill()

# Game loop
def game_loop():
    player = Player()
    all_sprites = pygame.sprite.Group()
    all_sprites.add(player)
    bullets = pygame.sprite.Group()

    running = True
    while running:
        screen.fill(BLACK)

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        keys = pygame.key.get_pressed()
        player.update(keys)
        player.set_angle(keys)

        # Shooting
        if keys[pygame.K_SPACE]:
            bullet = player.shoot()
            all_sprites.add(bullet)
            bullets.add(bullet)

        # Update all sprites
        all_sprites.update(keys)

        # Draw everything
        all_sprites.draw(screen)

        pygame.display.flip()
        clock.tick(60)

    pygame.quit()

# Run the game loop
game_loop()
