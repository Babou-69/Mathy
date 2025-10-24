
import random
def generate_exercise():
    total = random.randint(4,12)
    good = random.randint(1,total-1)
    enonce = f"On tire un élément parmi {total}, dont {good} sont favorables. Calculer P($A$) et P($A^c$)."
    correction = f"P($A$) = {good}/{total}. P($A^c$) = {total - good}/{total}."
    return enonce, correction

if __name__ == '__main__':
    e,c = generate_exercise()
    print('ÉNONCÉ:', e)
    print('CORRECTION:', c)
