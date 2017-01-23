const React = require('react')
const { memoize, search } = require('cerebro-tools')

const icon = 'http://caniuse.com/img/favicon-128.png'

const iframeStyles = {
  border: '0',
  alignSelf: 'flex-start',
  width: '100%',
  height: '100%'
}

const getFeatures = memoize(() => (
  fetch('http://caniuse.com/data.json')
    .then(response => response.json())
    .then(json => Object.keys(json.data).map(key => ({
      id: key,
      title: json.data[key].title,
      description: json.data[key].description,
    })))
), {
  // Expire features cache in 1 day
  maxAge: 24 * 60 * 60 * 1000
})

const toString = ({ id, title }) => [id, title].join(' ')

const BASE_URL = `https://caniuse.bitsofco.de/embed/index.html`
const periods = 'future_2,future_1,current,past_1,past_2,past_3'

const fn = ({term, display, actions}) => {
  let match = term.match(/^caniuse\s+(.+)$/)
  match = match || term.match(/^(.+)\s+caniuse$/)
  if (match) {
    getFeatures().then(features => {
      const results = search(features, match[1], toString).map(({id, description, title}) => {
        const embedUrl = `${BASE_URL}?feat=${id}&periods=${periods}`
        const caniuseUrl = `http://caniuse.com/#feat=${id}`
        return {
          id,
          icon,
          title,
          clipboard: caniuseUrl,
          subtitle: description,
          onSelect: () => actions.open(caniuseUrl),
          getPreview: () => (
            <iframe
              src={embedUrl}
              sandbox={'allow-scripts'}
              style={iframeStyles}
            />
          )
        }
      })
      display(results)
    })
  }
}

module.exports = {
  fn,
  icon,
  name: 'Search on caniuse.com',
  keyword: 'caniuse'
}
