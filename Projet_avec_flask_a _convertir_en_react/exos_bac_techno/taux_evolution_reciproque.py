
import random
def generate_exercise():
    p = random.choice([10,20,25])
    enonce = f"Une valeur augmente de {p} %. Quel taux faut-il appliquer pour revenir à la valeur initiale ?"
    coeff = 1 + p/100
    recip = 1/coeff
    recip_percent = (recip - 1) * 100
    correction = f"Coefficient réciproque = {recip:.3f}. Taux réciproque ≈ {recip_percent:.2f}\\%."
    return enonce, correction

if __name__ == '__main__':
    e,c = generate_exercise()
    print('ÉNONCÉ:', e)
    print('CORRECTION:', c)
