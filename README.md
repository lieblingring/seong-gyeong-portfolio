# Seong Gyeong — Portfolio Archive (GitHub + Decap CMS 버전)

썸네일 그리드 → 클릭 시 드래그로 살펴보는 상세페이지 뷰어 구조의 포트폴리오 사이트입니다.
등록·수정·삭제는 `/admin/` 페이지(Decap CMS)에서 하고, 실제 GitHub 저장소에 자동으로 저장됩니다.

```
portfolio-site/
├─ index.html          ← 공개 갤러리 페이지
├─ style.css
├─ script.js            ← 갤러리 렌더링 / 드래그 뷰어만 담당 (등록 기능 없음)
├─ data.js               ← 자동 생성 파일 (직접 수정 금지)
├─ build-data.js          ← content/works/*.md → data.js로 변환하는 빌드 스크립트
├─ package.json / netlify.toml  ← Netlify 빌드 설정
├─ admin/
│   ├─ index.html         ← 관리자 로그인 + Decap CMS 화면
│   └─ config.yml          ← Decap CMS 설정 (입력 필드 정의)
├─ content/works/          ← 등록된 작업물이 실제로 저장되는 곳 (.md 파일들)
└─ images/uploads/          ← 업로드한 이미지 파일이 저장되는 곳
```

## 왜 이렇게 바뀌었나

이전 버전은 브라우저 저장공간(localStorage → IndexedDB)에 이미지를 저장했는데, 두 가지 문제가 있었습니다.
1. **나만 보임**: 등록한 내용이 내 브라우저에만 저장되어, 다른 사람이 접속하면 보이지 않았습니다.
2. **용량 폭발**: 이미지를 코드 안에 텍스트(base64)로 직접 넣다 보니, 작업물이 늘어날수록 파일이 감당 안 되는 크기가 됐습니다 (17개 작업물에 139MB).

지금 구조는 이미지를 실제 파일로 GitHub 저장소에 저장하고, 등록 내용도 저장소 자체에 커밋됩니다. 그래서:
- **등록하는 즉시 모든 방문자에게 반영**됩니다 (Netlify가 자동으로 재배포).
- 이미지가 실제 파일이라 화질 손실이나 인위적인 압축이 필요 없습니다.
- 완전히 무료입니다 (GitHub + Netlify 무료 범위 안에서 충분).

## 처음 한 번만 하는 설정

### 1. 이 파일들을 GitHub 저장소에 올리기
기존 저장소의 파일을 전부 이 zip의 내용으로 교체해주세요 (폴더 구조 그대로 포함해서). GitHub 웹 화면의 `Add file → Upload files`에 폴더째로 드래그하면 하위 폴더 구조까지 그대로 올라갑니다.

### 2. Netlify를 "Git 연결" 방식으로 새로 만들기
지금까지 쓰던 "Netlify Drop"(파일 직접 드래그)은 자동 빌드를 못 하기 때문에, 이번엔 GitHub 저장소와 연결하는 방식으로 새로 만들어야 합니다.
1. Netlify 대시보드 → `Add new site`(또는 `새 프로젝트 추가`) → `Import an existing project`
2. GitHub 선택 → 처음이면 GitHub 인증/권한 허용 → 방금 올린 저장소 선택
3. Build command / Publish directory는 `netlify.toml`에 이미 적어뒀으니 자동으로 채워질 거예요 (`npm run build` / `.`) — 다르게 나오면 그대로 두거나 이 값으로 맞춰주세요.
4. `Deploy site` 클릭 → 첫 빌드가 진행되고, 완료되면 새 주소가 생깁니다.

### 3. Netlify Identity 켜기 (로그인 기능)
새 사이트의 `Site configuration` → `Identity` → `Enable Identity`.
- `Registration` 설정을 **`Invite only`(초대된 사람만)** 로 바꿔주세요. 그래야 아무나 가입해서 관리자가 되는 걸 막을 수 있습니다.

### 4. Git Gateway 켜기 (등록 내용이 GitHub에 저장되게 하는 연결고리)
같은 `Identity` 화면 안의 `Services` → `Git Gateway` → `Enable Git Gateway`.

### 5. 나 자신을 관리자로 초대하기
`Identity` 화면 → `Invite users` → 본인 이메일 입력 → 초대 메일 수신 → 링크 클릭해서 비밀번호 설정.

## 이후로 작업물 등록하는 방법

1. `https://내사이트주소/admin/` 접속
2. 초대받은 이메일/비밀번호로 로그인
3. `작업물` 컬렉션 → `New 작업물` → 명칭 / 카테고리 / 썸네일 / 상세페이지 이미지(여러 장, 순서대로) 입력
4. `Publish` 클릭 → GitHub에 자동 커밋되고, Netlify가 자동으로 다시 빌드·배포합니다 (보통 30초~1분 정도 걸려요).
5. 잠시 후 사이트를 새로고침하면 반영되어 있습니다. 수정·삭제도 같은 화면에서 가능합니다.

카테고리는 자유롭게 입력하는 대로 상단 메뉴에 자동으로 나타납니다 ("전체"는 항상 맨 앞에 고정).

## 디자인 메모

- 배경은 순수 블랙(`#0A0A0A`), 텍스트는 화이트, 별도의 포인트 컬러를 넣지 않았습니다 — 각 작업물 썸네일의 색이 곧 포인트 컬러가 되도록 의도한 구성입니다.
- 상단 워드마크 `SEONG GYEONG`은 Space Grotesk, 본문은 Inter, 인덱스 번호·카테고리 태그는 JetBrains Mono(모노스페이스)를 사용했습니다.
- 그리드는 화면 가운데로 정렬되고 양옆에 여백이 있어, 데스크탑 기준 한 줄에 4~5개 정도 보입니다.
