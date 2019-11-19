import { uglify } from 'rollup-plugin-uglify'

export default {
    input: 'build/index.js',
    output: {
        name: 'Barrage',
        file: 'build/barrage.min.js',
        format: 'iife',
        sourcemap: true
    },
    plugins: [uglify()]
}