import { defineConfig } from 'vitest/config'
// import { resolve } from 'path'

export default defineConfig({
  // build: { 
  //   lib: { 
  //     entry: resolve(__dirname, 'src/index.ts'),
  //     formats: ['es'],
  //     name: 'locateIntersections',
  //     fileName: 'locate-intersections',
  //   } 
  // },
  // resolve: { alias: { src: resolve('src/') } },
  test: {
    include: ['**/*.test.ts'],
    globals: true
  },
})