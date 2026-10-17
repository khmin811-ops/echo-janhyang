# 낙언공을 중심으로 파문처럼 퍼진 지역 경계 생성 → data/world.json 의 regions[].d / label 갱신
import json, math, random
random.seed(31)
CX, CY, SX = 500, 372, 1.5
INNER = 80
def R(t):  # 해안선 반경
    return 280 + 22*math.sin(5*t+.4) + 12*math.sin(13*t+1.3) + 7*math.sin(29*t)
def pt(r, t, wob=0):
    return (CX + (r)*math.cos(t)*SX, CY + (r)*math.sin(t))
def edge(t, outward=True):  # 파동 모양 방사 경계
    pts=[]
    for i in range(0, 41):
        r = INNER + (R(t)-INNER)*i/40
        tt = t + math.sin(r/14)*0.035
        pts.append(pt(r, tt))
    return pts if outward else pts[::-1]
def arc(r_fn, a, b, n=60):
    return [pt(r_fn(a+(b-a)*i/n), a+(b-a)*i/n) for i in range(n+1)]
def sector(a, b):
    A, B = math.radians(a), math.radians(b)
    if B < A: B += 2*math.pi
    p = edge(A) + arc(R, A, B) + edge(B, False) + arc(lambda t: INNER, B, A, 20)
    return "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in p) + " Z", pt((INNER+R((A+B)/2))*0.58, (A+B)/2)
w = json.load(open("data/world.json"))
S = {"mueum": (232, 315), "sogeum": (315, 352), "yeoul": (352, 62), "geurimja": (62, 112),
     "gachi": (112, 140), "pilgyeong": (140, 198), "saseul": (198, 232)}
for r in w["regions"]:
    if r["id"] in S:
        d, (lx, ly) = sector(*S[r["id"]]); r["d"] = d; r["label"] = [round(lx), round(ly)]
    elif r["id"] == "nakeongong":
        p = [pt(INNER-6+4*math.sin(i*1.7), i/40*2*math.pi) for i in range(40)]
        r["d"] = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in p) + " Z"; r["label"] = [CX, CY+4]
# 해안 전체 (육지 그림자)
coast = arc(R, 0, 2*math.pi, 240)
w["coast"] = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in coast) + " Z"
w["center"] = [CX, CY]
json.dump(w, open("data/world.json", "w"), ensure_ascii=False, indent=2)
print("ok")
