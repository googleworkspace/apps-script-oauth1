import gulp from 'gulp';
import concat from 'gulp-concat';
import expose from 'gulp-expose';
import stripLine from 'gulp-strip-line';
import gulpif from 'gulp-if';
import {deleteAsync} from 'del';
import jshint from 'gulp-jshint';
import stylish from 'jshint-stylish';

gulp.task('clean', () => deleteAsync(['dist/*']));

gulp.task('lint', () => gulp.src('src/*.gs')
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
);

gulp.task('dist', gulp.series('clean', 'lint', () => gulp.src('src/*.gs')
      .pipe(gulpif(/OAuth1\.gs$/,
          stripLine('var _ =')))
      .pipe(concat('OAuth1.gs'))
      .pipe(expose('this', 'OAuth1'))
      .pipe(gulp.dest('dist'))
));

