
import random
from fractions import Fraction
def generate_exercise():
    n = random.randint(20,60)
    a = random.randint(1, n//2)
    b = random.randint(1, n//2)
    c = random.randint(1, n//2)
    d = n - (a+b+c)
    enonce = (
    f"On a le tableau d'effectifs : "
    "\\["
    "\\begin{array}{c|cc}"
    " & A & A^{c} \\\\ \\hline "
    f"B & {a} & {b} \\\\ "
    f"B^{{c}} & {c} & {d} "
    "\\end{array}"
    "\\] Calculer la probabilité P(A) et la probabilité conditionnelle $P_B(A)$"
)

    total = n
    pB = Fraction(a+c, total)
    pA_given_B = Fraction(a, a+c) if (a+c)!=0 else Fraction(0,1)
    correction = f"$P(A) = {pB.numerator}/{pB.denominator}$. $P(A\\mid B) = {pA_given_B.numerator}/{pA_given_B.denominator}$."
    return enonce, correction

if __name__ == '__main__':
    e,c = generate_exercise()
    print('ÉNONCÉ:', e)
    print('CORRECTION:', c)
