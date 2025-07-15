.PHONY: start build clean install reinstall s l b c i r

start:
	pnpm dev
s: start

build:
	pnpm build
b: build

clean:
	rm -rf .next tsconfig.tsbuildinfo
c: clean

remove_modules:
	rm -rf node_modules

install:
	pnpm install
i: install

reinstall: clean remove_modules install
r: reinstall

test:
	pnpm test
