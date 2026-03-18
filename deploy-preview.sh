#!/bin/bash

set -e

rm -rf deploy-preview

npm run build
npm run build-storybook

cd example
npm i
npm run build
cd ..

mkdir deploy-preview
mv storybook-static deploy-preview/
mv example/build deploy-preview/

echo '<html><p><a href="/build">Example app<a></p><p><a href="/storybook-static">Storybook</a></p></html>' > deploy-preview/index.html
