#!/usr/bin/env bash
# 사용법: ./deploy.sh            -> surge 로 배포 (SURGE_DOMAIN, surge 로그인 필요)
#        ./deploy.sh gh-pages   -> GitHub Pages 저장소(ECHO_REPO_DIR)로 복사 후 push
set -e; cd "$(dirname "$0")"
node add-chapter.js --rebuild
if [ "$1" = "gh-pages" ]; then
  : "${ECHO_REPO_DIR:?ECHO_REPO_DIR 를 설정하세요}"
  rsync -a --delete --exclude .git --exclude preview --exclude node_modules ./ "$ECHO_REPO_DIR"/
  cd "$ECHO_REPO_DIR" && git add -A && git commit -m "잔향 업데이트 $(date +%F)" && git push
else
  npx --yes surge ./ "${SURGE_DOMAIN:-echo-janhyang.surge.sh}"
fi
