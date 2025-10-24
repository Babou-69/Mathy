
import random
def generate_exercise():
    a = random.randint(2,5)
    n = random.randint(2,4)
    m = random.randint(1,3)
    enonce = f"Calculer et simplifier : ${a}^{{{n}}}\\times {a}^{{{m}}}$."
    res = a**(n+m)
    correction = f"${a}^{{{n}}}\\times {a}^{{{m}}} = {a}^{{{n+m}}} = {res}$."
    return enonce, correction

if __name__ == '__main__':
    e,c = generate_exercise()
    print('ÉNONCÉ:', e)
    print('CORRECTION:', c)
