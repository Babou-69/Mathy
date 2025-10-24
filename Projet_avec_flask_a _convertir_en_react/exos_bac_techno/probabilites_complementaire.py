
import random
from fractions import Fraction
def generate_exercise():
    total = random.randint(4,12)
    good = random.randint(1,total-1)
    enonce = f"Calculer $P(A)$ et $P(A^c)$ quand {good} sur {total} sont favorables."
    p = Fraction(good, total)
    q = 1 - p
    correction = f"$P(A) = {p.numerator}/{p.denominator}$. $P(A^c)$ = {q.numerator}/{q.denominator}."
    return enonce, correction

if __name__ == '__main__':
    e,c = generate_exercise()
    print('ÉNONCÉ:', e)
    print('CORRECTION:', c)
