
import random
def generate_exercise():
    total = random.randint(80,200)
    a = random.randint(10,50)
    b = random.randint(10,50)
    inter = random.randint(0, min(a,b))
    enonce = f"Sur {total} personnes, {a} possèdent A, {b} possèdent B, et {inter} possèdent A et B. Calculer P(A $\cup$ B) en %."
    union = (a + b - inter) / total * 100
    correction = f"P(A $\cup$ B) = (a + b - intersection)/total = {a + b - inter}/{total} = {union:.2f} %."
    return enonce, correction

if __name__ == '__main__':
    e,c = generate_exercise()
    print('ÉNONCÉ:', e)
    print('CORRECTION:', c)
