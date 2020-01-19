const gulp =require('gulp');
const browserSync = require('browser-sync').create();
const del =require('del');
const autoprefixer =require('gulp-autoprefixer');
const plumber =require('gulp-plumber');
const pug =require('gulp-pug');
const sass =require('gulp-sass');
const sourcemaps =require('gulp-sourcemaps');
const watch =require('gulp-watch');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const fileinclude =require('gulp-file-include');
const rename =require('gulp-rename');
const notify =require('gulp-notify');
const cleanCss = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const rigger = require('gulp-rigger');

// const config = {
//     server: {
//         baseDir: "./build"
//     },
//     //tunnel: true,
//     host: 'localhost',
//     port: 3000,
// };

gulp.task('server', function() {
	browserSync.init({
		server: {
			baseDir: "./build/"
		}
	})
});

const path = {
    build : {
        html : './build',
        js : './build/js/',
        css : './build/css/',
        img : './build/img/',
        fonts : './build/fonts/'
    },
    src : {
        html : './src/pug/pages/*.pug',
        js : './src/js/main.js',
        css : './src/scss/main.scss',
        img : './src/img/**/*.*',
        fonts : './src/fonts/**/*.*'
    },
    watch : {
        html : './src/pug/**/*.pug',
        js : './src/js/**/*.js',
        css : './src/scss/**/*.scss',
        img : './src/img/**/*.*',
        fonts : './src/fonts/**/*.*'
    },
    clean : './build'
}

// Таск для сборки Pug файлов
gulp.task('html:build', function(callback) {
	return gulp.src(path.src.html)
		.pipe( plumber({
			errorHandler: notify.onError(function(err){
				return {
					title: 'Pug',
					sound: false,
					message: err.message
				}
			})
		}))
		.pipe( pug({
			pretty: true
		}) )
		.pipe( gulp.dest(path.build.html) )
		.pipe( browserSync.stream() )
	callback();
});

// Таск для компиляции SCSS в CSS
gulp.task('css:build', function(callback) {
	return gulp.src(path.src.css)
		.pipe( plumber({
			errorHandler: notify.onError(function(err){
				return {
					title: 'Styles',
			        sound: false,
			        message: err.message
				}
			})
		}))
		.pipe( sourcemaps.init() )
		.pipe( sass() )
		.pipe( autoprefixer({
			overrideBrowserslist: ['last 4 versions']
		}) )
		.pipe(gulp.dest(path.build.css))
        .pipe(cleanCss({compatibility: 'ie8'}))
        .pipe( sourcemaps.write() )
        .pipe(rename({suffix: '.min'}))
		.pipe( gulp.dest(path.build.css) )
		.pipe( browserSync.stream() )
	callback();
});

// Таск сборки картинок
gulp.task('image:build', function(callback) {
	gulp.src(path.src.img)
		.pipe( plumber({
			errorHandler: notify.onError(function(err){
				return {
					title: 'Images',
					sound: false,
					message: err.message
				}
			})
		}))
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()],
			interlaced: true
		}))
		.pipe(gulp.dest(path.build.img))
		.pipe( browserSync.stream() )
		callback();
});

//Таск для шрифтов
gulp.task('fonts:build', function(callback) {
	gulp.src(path.src.fonts)
		.pipe( plumber({
			errorHandler: notify.onError(function(err){
				return {
					title: 'Fonts',
					sound: false,
					message: err.message
				}
			})
		}))
		.pipe(gulp.dest(path.build.fonts))
		.pipe( browserSync.stream() )
		callback();
});

// Таск для компиляции JS
gulp.task('js:build', function(callback) {
	return gulp.src(path.src.js)
		.pipe( plumber({
			errorHandler: notify.onError(function(err){
				return {
					title: 'JS',
			        sound: false,
			        message: err.message
				}
			})
		}))
		.pipe( sourcemaps.init() )
		// .pipe(fileinclude({
		// 	prefix : '@@',
		// 	basepath: '@file'
		// }))	
		.pipe(rigger())	
		.pipe(gulp.dest(path.build.js))
		.pipe(uglify())		
		.pipe(rename({suffix: '.min'}))
		.pipe( sourcemaps.write() )
		.pipe( gulp.dest(path.build.js) )
		.pipe( browserSync.stream() )
	callback();
});

// Слежение за HTML и CSS и обновление браузера
gulp.task('watch', function() {
	// Следим за картинками и скриптами и обновляем браузер
	// watch( [path.build.js, path.build.img, path.build.html, path.build.fonts], gulp.parallel(browserSync.reload) );
	// Запуск слежения и компиляции SCSS с задержкой
	watch(path.src.css, function(){
		setTimeout( gulp.parallel('css:build'), 1000 )
	})
	// Слежение за PUG и сборка
	watch(path.src.html, gulp.parallel('html:build'))
	// Следим за картинками и копируем их в build
	watch(path.src.img, gulp.parallel('image:build'))
	watch(path.src.js, gulp.parallel('js:build'))
	watch(path.src.fonts, gulp.parallel('fonts:build'))
});

// удаление каталога BUILD 
gulp.task('clean', function (callback) {
	del.sync(path.clean);
	callback();
});

//LiveReload Task
gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task(
	'default', 
	gulp.series(
		gulp.parallel('clean'),
		gulp.parallel('html:build', 'css:build', 'js:build', 'fonts:build', 'image:build'),
		gulp.parallel('server', 'watch'), 
	)
);
