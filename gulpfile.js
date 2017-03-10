/**
 * @fileoverview
 * @author Taketoshi Aono
 */

const _                  = require('lodash');
const fs                 = require('fs');
const gulp               = require('gulp');
const path               = require('path');
const {execSync}         = require('child_process');

const DIST = 'app';
const BIN_DIR = path.resolve(process.cwd(), './node_modules/.bin/') + '/';


gulp.task('stop-serve', done => {
  try {
    const pid = fs.readFileSync('.dev.pid', 'utf8');
    process.kill(parseInt(pid, 10));
    fs.unlinkSync('.dev.pid');
  } catch(e) {
    throw new Error('Server process does not exists!');
  }  
});

function typescript(srcs = [], useSourcemaps = false) {
  const tsc = require('gulp-typescript');
  const sourceMaps = require('gulp-sourcemaps');
  const project = tsc.createProject('tsconfig.json', {
    typescript: require('typescript'),
    traceResolution: true
  });
  const src = gulp.src(srcs.concat(['src/**/*', '_references.ts']));
  return (() => {
    if (useSourcemaps) {
      return src.pipe(sourceMaps.init());
    }
    return src;
  })()
    .pipe(project());
}


/**
 * typescriptのコンパイル
 */
gulp.task('typescript', () => {
  return typescript(['!src/**/__tests__/**'])
    .pipe(gulp.dest('lib/'))
    .on('error', () => process.exit(1));
});


/**
 * typescriptのコンパイル
 */
gulp.task('typescript-test', () => {
  const sourceMaps = require('gulp-sourcemaps');
  return typescript([], true)
    .pipe(sourceMaps.write())
    .pipe(gulp.dest('lib/'))
    .on('error', () => process.exit(1));
});


/**
 * javascriptのminify
 */
gulp.task('minify', ['typescript'], () => {
  const browserify = require('gulp-browserify');
  return gulp.src('lib/main.js')
    .pipe(browserify({
      insertGlobals : true
    }))
    .pipe(gulp.dest(`${DIST}/`));
});


/**
 * 一時ファイルの削除
 */
gulp.task('clean', (cb) => {
  require('del')([DIST, 'lib'], cb);
});


const KARMA_CONF = require('./karma.conf')();


const doRunKarma = (singleRun, browser, done) => {
  const karma = require('karma');
  return new karma.Server(_.assign(KARMA_CONF, {
    browsers: [browser],
    singleRun: singleRun
  }), done).start();
};


const runKarma = (singleRun, browser, done) => {
  if (!singleRun) {
    doRunKarma(false, browser, done);
  } else {
    doRunKarma(true, browser, done);
  }
};


/**
 * karmaの起動
 */
gulp.task('test', ['typescript-test'], () => {
  require('glob').sync('./lib/**/__tests__/*.spec.js').forEach(c => {
    execSync(`node ./node_modules/.bin/mocha ${c}`, {stdio: [0, 1, 2]});
  });
});


/**
 * karmaの起動
 */
gulp.task('test-chrome', runKarma.bind(null, true, 'Chrome'));


/**
 * karmaの起動
 */
gulp.task('tdd-chrome', runKarma.bind(null, false, 'Chrome'));


/**
 * karmaの起動・監視
 */
gulp.task('tdd', runKarma.bind(null, false, 'PhantomJS'));


/**
 * karmaの起動・監視
 */
gulp.task('test-debug', runKarma.bind(null, true, 'PhantomJS_debug'));


gulp.task('default', ['build']);
