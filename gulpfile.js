const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const mainBowerFiles = require('main-bower-files');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const glob = require('glob');
const del = require('del');
const fs = require('fs');

const SOURCE = './src';
const PUBLIC = './app';
const CONFIG_DIR = './';
const CONFIG_FILE = 'config.js';
const CONFIG_DEV_FILE = 'config.dev.js';
const EXT = '{js,jsx,scss,css,map,html}';

let config = require(CONFIG_DIR + CONFIG_FILE);

// config
gulp.task('config', function() {
    delete require.cache[require.resolve(CONFIG_DIR + CONFIG_FILE)];
    let configMain = require(CONFIG_DIR + CONFIG_FILE);
    try {
        delete require.cache[require.resolve(CONFIG_DIR + CONFIG_DEV_FILE)];
        let configDev = require(CONFIG_DIR + CONFIG_DEV_FILE);
        config = Object.assign({}, configMain, configDev);
    } catch(e) {
        config = Object.assign({}, configMain);
        return $.file(CONFIG_DEV_FILE, 'module.exports = {\n\t\n};', {src: true})
            .pipe(gulp.dest(CONFIG_DIR));
    }
});

// cleaning
gulp.task('clean', function() {
    return del([PUBLIC]);
});
gulp.task('clean:lib', function() {
    return del([`${PUBLIC}/lib`]);
});
gulp.task('clean:html', function() {
    return del([`${PUBLIC}/**/*.html`]);
});
gulp.task('clean:js', function() {
    return del([`${PUBLIC}/js`]);
});
gulp.task('clean:jsx', function() {
	return del([`${PUBLIC}/jsx`]);
});
gulp.task('clean:css', function() {
    return del([`${PUBLIC}/**/*.css`, `${PUBLIC}/**/*.css.map`, `!${PUBLIC}/lib/**/*`]);
});
gulp.task('clean:other', function() {
    return del([`${PUBLIC}/**/*`, `!${PUBLIC}/**/*.${EXT}`]);
});

// files
gulp.task('bower:topcoat', ['clean:lib'], function() {
	return gulp.src('./bower_components/topcoat/**/*')
		.pipe(gulp.dest(`${PUBLIC}/lib/topcoat`));
});
gulp.task('bower:fontawesome', ['clean:lib'], function() {
	return gulp.src('./bower_components/font-awesome/**/*')
		.pipe(gulp.dest(`${PUBLIC}/lib/font-awesome`));
});
gulp.task('bower', ['config', 'bower:topcoat', 'bower:fontawesome'], function() {
    var filterNotMin = $.filter(['**/*.js', '!**/*.min.js'], {restore: true});
    return gulp.src(mainBowerFiles({
            overrides: {
                jquery: {main: './dist/*.min.js'},
                react: {main: './*.min.js'},
	            topcoat: {ignore: true},
	            'font-awesome': {ignore: true}
            }
        }))
        .pipe($.if(!config.dev, filterNotMin))
        .pipe($.if(!config.dev, $.uglify()))
        .pipe($.if(!config.dev, filterNotMin.restore))
        .pipe(gulp.dest(`${PUBLIC}/lib`));
});

gulp.task('scripts:jsx', ['clean:jsx'], function() {
    return gulp.src(`${SOURCE}/jsx/**/*.jsx`)
	    .pipe($.if(!config.dev, $.uglify()))
        .pipe(gulp.dest(`${PUBLIC}/jsx`));
});
gulp.task('scripts', ['clean:js', 'config', 'scripts:jsx'], function() {
    return new Promise(function(resolve) {
        let files =  glob.sync(`${SOURCE}/js/**/*.{js,jsx}`);
        let counter = 0;
        let next = function() {
            if (++counter === files.length) {
                resolve();
            }
        };
        for (let file of files) {
            let name = file.match(/[\w-]+.jsx?$/i)[0];
            let path = file.replace(name, '').replace(SOURCE, PUBLIC);
            name = name.replace(/.jsx$/, '.js');
            browserify(file, {debug: !!config.dev})
                .transform('babelify', {
                    presets: ['es2015', 'stage-0', 'react']
                })
                .bundle()
                .pipe(source(name))
                .pipe(buffer())
                .pipe($.if(!config.dev, $.uglify()))
                .pipe(gulp.dest(path))
                .on('end', next);
        }
    });
});

gulp.task('styles', ['clean:css', 'config'], function() {
    var filterSass = $.filter(['**/*.scss'], {restore: true});
    return gulp.src(`${SOURCE}/**/*.{scss,css}`)
        .pipe($.if(config.dev, $.sourcemaps.init()))
        .pipe(filterSass)
        .pipe($.sass())
        .pipe(filterSass.restore)
        .pipe($.if(!config.dev, $.csso()))
        .pipe($.if(config.dev, $.sourcemaps.write()))
        .pipe(gulp.dest(PUBLIC));
});

gulp.task('html:replace', ['clean:html'], function() {
    return gulp.src(`${SOURCE}/**/*.html`)
        .pipe(gulp.dest(PUBLIC));
});
gulp.task('html:combine', ['config', 'html:replace', 'bower', 'scripts', 'styles'], function() {
    if (config.dev) {
        return true;
    } else {
        return gulp.src(`${PUBLIC}/**/*.html`)
            .pipe($.useref())
            .pipe(gulp.dest(PUBLIC));
    }
});
gulp.task('html', ['config', 'html:combine'], function() {
    if (config.dev) {
        return true;
    } else {
        return gulp.src(`${PUBLIC}/**/*.html`)
            .pipe($.minifyHtml())
            .pipe(gulp.dest(PUBLIC));
    }
});

gulp.task('extra', ['clean:other', 'config'], function() {
    return gulp.src([`${SOURCE}/**/*`, `!${SOURCE}/**/*.${EXT}`])
        .pipe(gulp.dest(PUBLIC));
});


// main
gulp.task('build', ['bower', 'scripts', 'styles', 'html', 'extra'], function() {
    return gulp.src(`${PUBLIC}/**/*`)
        .pipe($.size({gzip: true}));
});
gulp.task('watch', function() {
    gulp.watch('./bower_components/**/*', ['bower']);
    gulp.watch(`${SOURCE}/**/*.html`, ['html']);
    gulp.watch(`${SOURCE}/**/*.{js,jsx}`, ['scripts']);
    gulp.watch(`${SOURCE}/**/*.{scss,css}`, ['styles']);
    gulp.watch([`${SOURCE}/**/*`, `!${SOURCE}/**/*.${EXT}`], ['extra']);
    gulp.watch([CONFIG_DIR + CONFIG_FILE, CONFIG_DIR + CONFIG_DEV_FILE], ['build']);
});