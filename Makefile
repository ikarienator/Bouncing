
compile: src/utils/Language.js src/utils/Math.js src/utils/Attributes.js src/sprite/Sprite.js src/sprite/RectSprite.js src/sprite/EllipseSprite.js src/sprite/ImageSprite.js src/sprite/TextSprite.js src/device/Canvas.js src/surface/Surface.js
	echo '' > bouncing.debug.js
	for file in $? ; do \
		cat $$file >> bouncing.debug.js ; echo "" >> bouncing.debug.js ; \
	done
	uglifyjs -o bouncing.js bouncing.debug.js
	
.PHONY: compile