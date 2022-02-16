#!/usr/bin/env sh

# https://vitepress.vuejs.org/guide/deploy.html

# abort on errors
set -e

# build
# npm run docs:build
npm run build

# navigate into the build output directory
# cd docs/.vitepress/dist
cd .vitepress/dist

# if you are deploying to a custom domain
echo 'www.protagram.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# if you are deploying to https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

# if you are deploying to https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages
git push -f git@github.com:kryushiki/protagram.git master:gh-pages