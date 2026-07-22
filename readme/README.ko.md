<p align="center">
  <img src="https://youran-tab.du-fu.com/logo.png" alt="Youran Tab" width="80" height="80" />
</p>

<h1 align="center">Youran Tab</h1>

<p align="center">
  Chrome, Edge, Firefox 및 360, QQ 브라우저, Sogou 브라우저 등을 지원하는 오픈 소스 기반의 자유롭게 사용자 지정할 수 있는 새 탭 확장 프로그램입니다.
  <br />
  모든 데이터는 로컬에 저장됩니다. 로그인할 필요가 없으며 어떤 정보도 수집하지 않습니다.
  <br /><br />
  <a href="https://youran-tab.du-fu.com/">공식 웹사이트</a>
  <br /><br />
  <a href="../README.md">English</a> ·
  <a href="./README.zh-CN.md">简体中文</a> ·
  <a href="./README.zh-TW.md">繁體中文</a> ·
  <a href="./README.ja.md">日本語</a> ·
  <a href="./README.ko.md">한국어</a> ·
  <a href="./README.es.md">Español</a> ·
  <a href="./README.fr.md">Français</a> ·
  <a href="./README.de.md">Deutsch</a> ·
  <a href="./README.ru.md">Русский</a> ·
  <a href="./README.it.md">Italiano</a>
</p>

## 설치

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/aghmmgdpejlegikblfffnefbkehjdgel?style=for-the-badge&logo=googlechrome&logoColor=white&label=Chrome)](https://chromewebstore.google.com/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/aghmmgdpejlegikblfffnefbkehjdgel)
[![Edge Add-ons](https://custom-icon-badges.demolab.com/badge/dynamic/json?style=for-the-badge&logo=edge-white&logoColor=white&label=Edge&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fbijgffabnhpieoedkhlfbijmgollbpbf&color=0078D7)](https://microsoftedge.microsoft.com/addons/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/bijgffabnhpieoedkhlfbijmgollbpbf)
[![Firefox Add-ons](https://img.shields.io/amo/v/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5?style=for-the-badge&logo=firefoxbrowser&logoColor=white&label=Firefox)](https://addons.mozilla.org/firefox/addon/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/)

## 테마

| 테마 | 설명 |
|------|------|
| 클래식 | 열 수, 간격, 모서리 반경, 투명도, 아이콘 크기를 조절할 수 있는 전통적인 그리드 레이아웃 |
| 벤토 | 고정형 또는 반응형 그리드를 지원하며 클릭 수를 자동 집계하고 사용 빈도에 따라 항목을 확대하는 카드 레이아웃 |
| 터미널 | 9가지 색상 구성, 4가지 커서 스타일, 사용자 지정 프롬프트를 갖춘 완전한 명령줄 환경 |
| 미니멀 | 불필요한 요소를 모두 제거하고 사이트만 표시 |
| 글래스 | 열 수를 조절할 수 있는 가로 목록 형태의 반투명 알약형 카드 |
| 버블 | 고정 또는 무작위 배치와 크기 조절을 지원하는 원형 플로팅 버블 |
| 픽셀 | 명령줄 스타일 검색창과 메뉴 기반 상호 작용을 갖춘 복고풍 픽셀 스타일 |
| 메모지 | 압정 장식, 다채로운 종이, 메이슨리 레이아웃을 사용한 메모 게시판 스타일 |

## 기능

- 주요 검색 엔진과 AI 도우미가 내장된 검색창. 필요한 서비스를 활성화하고 기본값을 선택하거나 검색창 앞에서 일시적으로 전환 가능
- 단색, 그라데이션, 이미지, 무작위 등 여러 배경 모드와 라이트 및 다크 모드별 독립 설정
- 시스템 설정을 자동으로 따르거나 수동으로 전환할 수 있는 다크 모드
- 3개의 온라인 아이콘 소스, 사용자 지정 아이콘 업로드, 다크 모드 전용 아이콘 지원
- 사이트 설정을 JSON 형식으로 가져오고 내보내 간편하게 이전 가능

## 지원 언어

10개 언어를 지원하며 브라우저 언어를 자동으로 감지합니다.

`简体中文` `繁體中文` `English` `日本語` `한국어` `Español` `Français` `Deutsch` `Русский` `Italiano`

## 기술 스택

- [Svelte](https://svelte.dev/) — UI 프레임워크
- [Vite](https://vite.dev/) — 빌드 도구
- [Tailwind CSS](https://tailwindcss.com/) — CSS 프레임워크
- [Bun](https://bun.sh/) — 패키지 관리자 및 런타임

## 개발

```bash
# 의존성 설치
bun install

# 개발 서버 시작
bun run dev

# Chrome / Edge용 빌드
bun run build

# Firefox용 빌드
bun run build:firefox

# 모든 플랫폼 패키징
bun run release
```

## 브라우저 호환성

| 브라우저 | 설치 방법 |
|----------|-----------|
| Chrome | [Chrome 웹 스토어](https://chromewebstore.google.com/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/aghmmgdpejlegikblfffnefbkehjdgel) |
| Edge | [Microsoft Edge 추가 기능](https://microsoftedge.microsoft.com/addons/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/bijgffabnhpieoedkhlfbijmgollbpbf) |
| Firefox | [Firefox 부가 기능](https://addons.mozilla.org/firefox/addon/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/) |
| 360, QQ 브라우저, Sogou 브라우저, Cheetah 브라우저 등 | [Microsoft Edge 추가 기능](https://microsoftedge.microsoft.com/addons/detail/%E6%82%A0%E7%84%B6%E6%A0%87%E7%AD%BE%E9%A1%B5/bijgffabnhpieoedkhlfbijmgollbpbf)에서 설치할 수 있으며 완벽하게 호환됨 |

## 라이선스

MIT
