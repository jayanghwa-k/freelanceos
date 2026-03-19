# FreelanceOS 📁

프리랜서용 프로젝트 매니지먼트 대시보드

## 파일 구성

| 파일 | 설명 |
|------|------|
| `dashboard.html` | 메인 대시보드 (수익, 프로젝트, 인보이스 요약) |
| `projects.html` | 프로젝트 관리 (칸반 보드 + 리스트 뷰) |
| `clients.html` | 클라이언트 정보 관리 |
| `invoices.html` | 인보이스 목록 및 작성 |
| `invoice-client.html` | 클라이언트 전자서명 페이지 (URL 공유용) |
| `calendar.html` | 일정 캘린더 (월/주/목록 뷰) |

## 로컬 실행 방법

### 방법 1 — 그냥 더블클릭
`dashboard.html` 파일을 브라우저로 열면 바로 실행됩니다.

### 방법 2 — VS Code Live Server (권장)
1. VS Code에서 폴더 열기
2. Live Server 확장 설치
3. `dashboard.html` 우클릭 → "Open with Live Server"
→ 페이지 이동, 사이드바 상태 저장 등이 더 잘 작동합니다.

### 방법 3 — Python 로컬 서버
```bash
cd FreelanceOS
python3 -m http.server 3000
# 브라우저에서 http://localhost:3000/dashboard.html
```

## 인보이스 전자서명 테스트

1. `invoices.html` → 인보이스 행 클릭 → 우측 패널
2. "클라이언트 뷰 미리보기" 버튼 클릭
3. `invoice-client.html` 열림 → 비밀번호: **8f3k**
4. 서명 후 제출

## 사이드바

- 사이드바 우측 중앙 **◀ 버튼**으로 접기/펼치기
- 접힌 상태 → 아이콘만 표시, 마우스 올리면 툴팁
- 상태는 브라우저에 자동 저장 (localStorage)

## 다음 단계 (나중에)

- [ ] Supabase 연동 → 실제 데이터 저장
- [ ] Vercel 배포 → 어디서든 URL 접속
- [ ] 클라이언트 전자서명 실제 저장
- [ ] 이메일 발송 기능 (SendGrid 등)
