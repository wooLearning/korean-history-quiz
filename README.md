# 공무원 한국사 빈칸 퀴즈

정적 HTML로 만든 한국사 빈칸 채우기 문제풀이 앱입니다. GitHub Pages에 그대로 배포할 수 있습니다.

## 실행

```powershell
npm test
python -m http.server 5173
```

브라우저에서 `http://localhost:5173`을 엽니다.

## 구성

- `questions.json`: 문제은행
- `data/base-questions.json`: 문제은행 생성용 기준 문항
- `scripts/build-question-bank.mjs`: 10세트 1000문제 생성 스크립트
- `index.html`: 화면 구조
- `app.js`: 필터, 채점, 진행률, 기록 저장
- `styles.css`: 반응형 스타일
- `tests/validate-data.mjs`: 문제 데이터와 앱 참조 검증

## 참고

2026년 현재 9급 공채 한국사는 필기 공통 과목으로 운영되며, 2027년부터는 한국사능력검정시험으로 대체되는 개편이 예고되어 있습니다. 이 문제은행은 실제 기출문제 복제가 아니라, 공무원 한국사 대비 기본 암기용 자체 제작 문항입니다.
