import json
from decimal import Decimal, getcontext
import mysql.connector
n
getcontext().prec = 100

Q = Decimal(2) ** 120
DELTA = Decimal(2) ** 80

with open("received_vector.json", "r") as f:
    received = json.load(f)
c1 = [Decimal(x) for x in received["c1"]]
c2 = [Decimal(x) for x in received["c2"]]
s = [Decimal(x) for x in received["s"]]


conn = mysql.connector.connect(
    user='root',
    password='inhaEEE',
    unix_socket='/var/run/mysqld/mysqld.sock',
    database='EEE'
)
cursor = conn.cursor()
cursor.execute("SELECT vector FROM feature WHERE user_email = 'cccc1111@gmail.com'")
result = cursor.fetchone()
conn.close()

if not result:
    print(" DB에 암호문이 없음")
    exit()

db_vec = json.loads(result[0])
c1_dash = [Decimal(x) for x in db_vec["c1"]]
c2_dash = [Decimal(x) for x in db_vec["c2"]]

c1_tilde = [(a - b) % Q for a, b in zip(c1, c1_dash)]
c2_tilde = [(a - b) % Q for a, b in zip(c2, c2_dash)]

d1 = [(x * x) % Q for x in c1_tilde]
d2 = [(2 * x * y) % Q for x, y in zip(c1_tilde, c2_tilde)]
d3 = [(y * y) % Q for y in c2_tilde]

def signed_mod_q(x):
    return x if x <= Q / 2 else x - Q

s_decimal = s
s2 = [x * x for x in s_decimal]

m_squared = [(d1[i] + d2[i] * s_decimal[i] + d3[i] * s2[i]) % Q for i in range(len(d1))]
m_signed = [signed_mod_q(x) for x in m_squared]
m_float = [float(x / (DELTA * DELTA)) for x in m_signed]

print(" 거리 복호화 완료 (앞 10개):")
for i in range(10):
    print(f"[{i}] 거리^2 = {m_float[i]:.6e}")

max_error = max(abs(x) for x in m_float)
mse = sum(x * x for x in m_float) / len(m_float)

print(f"\n 최대 거리^2: {max_error:.6e}")
print(f" 평균 제곱 오차 (MSE): {mse:.6e}")

