const pathToRegexp = require('path-to-regexp')

const isCurrentNav = (route, parent, path) => {
  const navPath = path.startsWith('/') ? path.substring(1) : path

  // merge nav path to the parent array
  const segmentsToMatch = parent.concat(navPath.split('/'))

  // can't match a path with more segments than current route
  if(segmentsToMatch.length > route.length) {
    return {
      isMatch: false,
      params: {}
    }
  }

  // construct a route based on the number of segments to match
  const routeAsString = route.slice(0, segmentsToMatch.length).join('/')

  var keys = []
  const regexp = pathToRegexp(segmentsToMatch.join('/'), keys)
  const result = regexp.exec(routeAsString)

  const isMatch = result === null ? false : true
  const params = (result && keys.length > 0) ? constructParams(result.slice(1), keys) : {}

  return {
    isMatch,
    params
  }
}

const constructParams = (matchedGroups, keys) =>
  keys.map((k, index) => ({
    name: k.name,
    value: matchedGroups[index]
  }))

const execute = ({route, parentPath, path, expectedResult}) => {
  const { isMatch, params } = isCurrentNav(route, parentPath, path)

  console.log(`route: [${route}], parent: ${parentPath}, path: '${path}'`)

  if (isMatch === expectedResult) {
    console.log('-> Success!')
  } else {
    console.log('-> Failed')
  }

  const paramsList = Object.entries(params)
  if(paramsList.length > 0) {
    console.log('\nAnd it has following route params:')
    paramsList.forEach(
      ([key, value]) => console.log(key, ': ', value)
    )
  }
  console.log('-------------------------------------------\n')
}

[
  { route: ['foo', 'bar', '123'], parentPath: [],                  path: '/foo',       expectedResult: true},
  { route: ['foo', 'bar', '123'], parentPath: ['foo'],               path: '/bar',       expectedResult: true},
  { route: ['foo', 'bar', '123'], parentPath: ['foo','bar'],         path: '/:id',       expectedResult: true},
  { route: ['foo', 'bar', '123'], parentPath: ['foo', 'bar', ':id'], path: '/something', expectedResult: false},
  { route: ['foo', 'bar', 'cat'], parentPath: ['foo'],               path: '/bar/cat',   expectedResult: true},
  { route: ['foo', '123', 'bar', '456'], parentPath: ['foo',':foo_id', 'bar'], path: '/:bar_id', expectedResult: true},
].forEach(
  arguments => execute(arguments)
)
