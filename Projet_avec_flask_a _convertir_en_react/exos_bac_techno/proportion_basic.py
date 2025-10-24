
import random
from fractions import Fraction
def generate_exercise():
    total = random.randint(30,120)
    part = random.randint(3, min(30, total-3))
    enonce = f"Dans un groupe de {total}, {part} sont concernés. Exprimer la proportion (fraction, décimale, pourcentage)."
    dec = part/total
    correction = f"Fraction : {part}/{total}. Décimale : {dec:.4f}. Pourcentage : {dec*100:.1f}%."
    return enonce, correction

if __name__ == '__main__':
    e,c = generate_exercise()
    print('ÉNONCÉ:', e)
    print('CORRECTION:', c)
