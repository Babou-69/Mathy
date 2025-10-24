
import random
from fractions import Fraction
def generate_exercise():
    num = random.randint(1,9)
    den = random.choice([2,4,5,10])
    frac = Fraction(num, den)
    enonce = f"Écrire la fraction ${num}/{den}$ sous forme irréductible puis en pourcentage."
    dec = float(frac)
    correction = f"Irréductible : {frac.numerator}/{frac.denominator}. Pourcentage : {dec*100:.1f}%."
    return enonce, correction

if __name__ == '__main__':
    e,c = generate_exercise()
    print('ÉNONCÉ:', e)
    print('CORRECTION:', c)
