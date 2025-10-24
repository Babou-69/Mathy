
import random
def generate_exercise():
    total = random.randint(50,200)
    subgroup = random.randint(5, min(40, total-5))
    enonce = f"Dans une ville de {total} habitants, {subgroup} parlent une langue. Calculer la proportion (fraction et pourcentage)."
    cent_sub = 100*subgroup
    perc = round(cent_sub/total,2)
    correction = f"Fraction : {subgroup}/{total}. Pourcentage : {perc} %."
    return enonce, correction

if __name__ == '__main__':
    e,c = generate_exercise()
    print('ÉNONCÉ:', e)
    print('CORRECTION:', c)
