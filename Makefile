.PHONY: all

all: face.min.svg

face.min.svg: face.svg
	inkscape --export-plain-svg=$@ $<
