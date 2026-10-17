# 잔향 (殘響 · ECHO) 세계관 사이트

정적 사이트 (빌드 불필요). `index.html` + `style.css` + `app.js` 가 `data/` 의 JSON/MD 를 읽어 그린다.

## 구조
- `data/world.json` — 세계 설정(lore), 세력(factions: color/power), 지도 지역(regions: faction, path d, label, lore), 인물(characters), 지도 이벤트(events)
- `data/chapters/day-NNN.md` — 일일 챕터 (frontmatter + 본문, 빈 줄로 문단 구분)
- `data/chapters/index.json` — 자동 생성 목록 (직접 수정 X)
- `assets/portraits/<id>.jpg` — 인물 초상 (world.json 의 img 경로), `assets/hero.jpg` — 메인 배경
- `scripts/gen_map.py` — 지도 지역 경계(파문 섹터) 재생성
- `scripts/preview.py` — playwright 로 preview/*.png 렌더 (로컬 서버 :8787 필요)

## 매일 챕터 추가
```
node add-chapter.js --title "제목" --file body.txt --location 필경도 --characters harin,gwonmuk \
  [--region saseul=scribe] [--power scribe=+3,silence=-2] [--event "서기원이 사슬숲을 점령"] [--event-region saseul]
# 또는: cat body.txt | node add-chapter.js --title "제목"
./deploy.sh gh-pages   # ECHO_REPO_DIR=GitHub Pages 저장소 클론 경로
```
챕터 파일 형식:
```
---
day: 2
title: 제목
date: 2026-10-19
location: 필경도
characters: harin, gwonmuk
---
본문 문단 1

본문 문단 2
```
faction id: silence(침묵교단) / scribe(서기원) / echo(메아리) / ruin / neutral
region id: mueum, pilgyeong, yeoul, nakeongong, saseul, geurimja, sogeum, gachi
character id: hangyeol, muyeong, harin, dokkaebi, first-speaker, yeoul, gwonmuk, dan
