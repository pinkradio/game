"""Genetic algorithm TSP demo: generate 100 random points and search a short tour."""

import math
import random
from typing import List, Sequence

# Genetic algorithm parameters
POP_SIZE = 300
CROSS_RATE = 0.9
MUT_RATE = 0.2
TOUR_SIZE = 5
N_GENERATIONS = 600
SEED = 42  # set to None for a fresh random run each time

Point = tuple[int, float, float]  # (key, x, y)
Tour = List[int]


def gen_points(n: int, seed: int | None = None) -> List[Point]:
    """Create n points with unique keys and random coordinates."""
    if seed is not None:
        random.seed(seed)
    return [(i, random.random() * 1000.0, random.random() * 1000.0) for i in range(n)]


def build_dist_matrix(points: Sequence[Point]) -> List[List[float]]:
    """Precompute pairwise distances to speed up evaluation."""
    n = len(points)
    dist = [[0.0] * n for _ in range(n)]
    for i in range(n):
        _, xi, yi = points[i]
        for j in range(i + 1, n):
            _, xj, yj = points[j]
            d = math.hypot(xi - xj, yi - yj)
            dist[i][j] = dist[j][i] = d
    return dist


def tour_length(tour: Sequence[int], dist: List[List[float]]) -> float:
    total = 0.0
    for i in range(len(tour)):
        a = tour[i]
        b = tour[(i + 1) % len(tour)]
        total += dist[a][b]
    return total


def tournament_selection(population: List[Tour], fitness: List[float]) -> Tour:
    """Pick the best individual from a random mini-tournament."""
    best_idx = random.randrange(len(population))
    for _ in range(1, TOUR_SIZE):
        idx = random.randrange(len(population))
        if fitness[idx] > fitness[best_idx]:
            best_idx = idx
    return population[best_idx]


def order_crossover(parent1: Sequence[int], parent2: Sequence[int]) -> Tour:
    """Order crossover (OX)."""
    a, b = sorted(random.sample(range(len(parent1)), 2))
    child = [None] * len(parent1)
    child[a:b] = parent1[a:b]

    insert_pos = b
    for gene in parent2[b:] + parent2[:b]:
        if gene not in child:
            if insert_pos >= len(child):
                insert_pos = 0
            child[insert_pos] = gene
            insert_pos += 1
    return child  # type: ignore[return-value]


def mutate(tour: Tour) -> None:
    i, j = random.sample(range(len(tour)), 2)
    tour[i], tour[j] = tour[j], tour[i]


def main() -> None:
    points = gen_points(100, SEED)
    dist = build_dist_matrix(points)
    n = len(points)

    population: List[Tour] = [random.sample(range(n), n) for _ in range(POP_SIZE)]

    initial_lengths = [tour_length(t, dist) for t in population]
    best_idx = min(range(len(population)), key=lambda idx: initial_lengths[idx])
    best_tour = population[best_idx][:]
    best_len = initial_lengths[best_idx]

    for gen in range(N_GENERATIONS):
        lengths = [tour_length(t, dist) for t in population]
        fitness = [1.0 / l for l in lengths]

        new_pop: List[Tour] = []
        while len(new_pop) < POP_SIZE:
            p1 = tournament_selection(population, fitness)
            p2 = tournament_selection(population, fitness)
            if random.random() < CROSS_RATE:
                child = order_crossover(p1, p2)
            else:
                child = p1[:]
            if random.random() < MUT_RATE:
                mutate(child)
            new_pop.append(child)

        population = new_pop

        for t in population:
            length = tour_length(t, dist)
            if length < best_len:
                best_len = length
                best_tour = t[:]

        if gen % 50 == 0:
            print(f"Gen {gen}: best length = {best_len:.2f}")

    print("\nBest tour length:", round(best_len, 2))
    print("Visit order (keys):", [points[i][0] for i in best_tour])


if __name__ == "__main__":
    main()

