
import random
def generate_exercise():
    total = random.randint(60,150)
    part1 = random.randint(5, min(30, total-5))
    part2 = random.randint(1, min(10, part1))
    enonce = f"Sur {total} personnes, {part1} aiment le sport ; parmi eux, {part2} pratiquent le foot. Calculer la proportion de foot parmi l'ensemble (en %)."
    perc = (part2/total)*100
    correction = f"Proportion = {part2}/{total} = {perc:.2f}%."
    return enonce, correction

if __name__ == '__main__':
    e,c = generate_exercise()
    print('ÉNONCÉ:', e)
    print('CORRECTION:', c)
