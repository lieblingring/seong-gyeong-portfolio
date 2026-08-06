/*
  build-data.js
  ----------------------------------------------------------------
  Netlify가 배포할 때마다 자동으로 실행되는 스크립트입니다.
  content/works/ 안에 Decap CMS가 만들어둔 .md 파일들을 읽어서,
  사이트가 실제로 사용하는 data.js 파일을 새로 만들어줍니다.
  → 이 파일은 사람이 직접 수정할 필요가 없습니다.
----------------------------------------------------------------
*/
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const CONTENT_DIR = path.join(__dirname, "content", "works");
const OUTPUT_FILE = path.join(__dirname, "data.js");

let items = [];

if (fs.existsSync(CONTENT_DIR)) {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));

  items = files.map((file) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
    const { data } = matter(raw);
    const images = Array.isArray(data.images)
      ? data.images.map((img) => (typeof img === "string" ? img : img.src)).filter(Boolean)
      : [];

    return {
      id: "work-" + path.basename(file, ".md"),
      title: data.title || "",
      category: data.category || "",
      type: "image",
      thumb: data.thumbnail || "",
      details: images,
      order: typeof data.order === "number" ? data.order : null,
      _slug: file,
    };
  });

  // 정렬: "노출 순서"가 있으면 그 숫자 기준(작을수록 먼저), 없으면 최신 등록순(파일명 뒤쪽이 최신)
  items.sort((a, b) => {
    if (a.order !== null && b.order !== null) return a.order - b.order;
    if (a.order !== null) return -1;
    if (b.order !== null) return 1;
    return a._slug < b._slug ? 1 : -1;
  });

  items = items.map(({ _slug, order, ...rest }) => rest); // 최종 출력에는 불필요한 필드 제거
}

const content =
  "/*\n" +
  "  data.js — 자동 생성 파일입니다. 직접 수정하지 마세요.\n" +
  "  Decap CMS(/admin/)에서 등록한 내용을 바탕으로 빌드할 때마다 새로 만들어집니다.\n" +
  "*/\n\n" +
  "const PORTFOLIO_DATA = " + JSON.stringify(items, null, 2) + ";\n";

fs.writeFileSync(OUTPUT_FILE, content, "utf8");
console.log(`[build-data] data.js 생성 완료 — 작업물 ${items.length}개`);
