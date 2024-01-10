let sidebar

window.addEventListener('load', () => {
  window.setTimeout(() => {
    window.app.on('popup-open', handlePopup)
    window.app.on('sidebar-ready', handleSidebar)
  }, 0)
})

function tabs (div) {
  Array.from(div.querySelectorAll('div.horizontal-tabs')).forEach(d => {
    const header = d.querySelector('ul.horizontal-tabs-list')
    const panesParent = d.querySelector('div[data-horizontal-tabs-panes]')
    const panes = []
    const headers = []

    Array.from(panesParent.children).forEach(p => {
      if (p.nodeName === 'DETAILS') {
        panes.push(p)
        const li = document.createElement('li')
        headers.push(li)
        if (p.hasAttribute('open')) {
          li.classList.add('active')
        }

        const a = document.createElement('a')
        a.href = '#'
        a.onclick = () => {
          panes.forEach(p1 => {
            p1.removeAttribute('open')
          })
          headers.forEach(l1 => {
            l1.classList.remove('active')
          })
          p.setAttribute('open', 'open')
          li.classList.add('active')
          return false
        }
        a.innerHTML = p.querySelector('summary').innerHTML

        li.appendChild(a)
        header.appendChild(li)
      }
    })
  })
}

function handlePopup (div) {
  captureLinks(div)
  tabs(div)
}

function handleSidebar (display) {
  sidebar = display
  captureLinks(display.content)
  captureAutocomplete(display.content)
  tabs(display.content)
}

function captureLinks (dom) {
  const currentPath = app.state.current.path ? app.state.current.path.split('?')[0] : '/'

  Array.from(dom.querySelectorAll('a')).forEach(link => {
    const path = link.getAttribute('href')

    if (path && path.substr(0, 1) !== '#') {
      link.target = app.state.current.embed === 'true' ? '_top' : '_blank'
    }

    if (path.substr(0, 1) === '?') {
      link.href = currentPath + path
    }

    link.onclick = () => {
      if (!['/', '?'].includes(path.substr(0, 1))) {
        return true
      }

      if (!sidebar) {
        return true
      }

      sidebar.content.innerHTML = ''

      if (app.timelineLayers && app.timelineLayers.length && app.timelineLayers[0].data) {
        const items = app.timelineLayers[0].data.filter(item => {
          return item.url === link.href
        })
        if (items.length) {
          app.state.apply({ id: items[0].id, path: null, map: 'auto' }, { update: 'push' })
          return false
        }
      }

      sidebarReload(path)
      return false
    }
  })

  Array.from(dom.querySelectorAll('form')).forEach(form => {
    form.onsubmit = () => {
      sidebar.content.innerHTML = ''
      sidebarReload('?' + new URLSearchParams(new FormData(form)).toString())
      return false
    }
  })
}

function sidebarReload (path) {
  if (path.substr(0, 1) === '?') {
    path = sidebar.url.match(/^([^\?]+)(\?.*|)$/)[1] + path
  }

  fetch(path)
    .then(req => {
      if (req.status !== 200) {
        sidebar.content.innerHTML = req.statusText
        sidebar.emit('ready')
        return null
      }

      return req.text()
    })
    .then(body => {
      const x = document.createElement('div')
      x.innerHTML = body

      const content = x.querySelector('#content .region')
      let shortlink = x.querySelector('link[rel=shortlink]')
      if (shortlink) {
        const m = shortlink.getAttribute('href').match(/\/node\/([0-9]+)$/)
        if (m) {
          const id = m[1]
          app.state.apply({ id, path: null, map: 'auto' }, { update: 'push' })
          return
        } else {
          shortlink = null
        }
      }

      tabs(sidebar.content)

      if (!shortlink) {
        sidebar.content.innerHTML = content ? content.innerHTML : ''
        sidebar.url = path
        app.state.apply({ id: null, path }, { update: 'push' })
      }

      sidebar.emit('ready')
    })
}

function captureAutocomplete (div) {
  const ul = document.createElement('ul')
  ul.className = 'ui-menu ui-widget ui-widget-content ui-autocomplete ui-front'
  ul.style.display = 'none'
  ul.unselectable = 'on'

  ul.style.position = 'absolute'
  
  sidebar.content.appendChild(ul)

  Array.from(div.querySelectorAll('input[data-autocomplete-path]')).forEach(input => {

    input.autocomplete = 'off'

    const path = input.getAttribute('data-autocomplete-path')
    input.addEventListener('input', e => {
      loadAutocomplete(path, input.value, (err, list) => {
        ul.innerHTML = ''

        list.forEach(item => {
          const li = document.createElement('li')
          li.className = 'ui-menu-item'

          const a = document.createElement('a')
          a.className = 'ui-menu-item-wrapper'
          a.innerHTML = item.label
          a.onmousedown = () => {
            input.value = item.value
            ul.style.display = 'none'
          }

          li.appendChild(a)
          ul.appendChild(li)
        })
      })

      ul.style.top = (input.offsetHeight + input.offsetTop) + 'px'
      ul.style.left = input.offsetLeft + 'px'
      ul.style.display = 'block'
    })

    input.addEventListener('blur', e => {
      ul.style.display = 'none'
    })
  })
}

const autocompleteDelay = 250
let autocompleteTimeout
let autocompleteId
function loadAutocomplete (path, value, callback) {
  if (autocompleteTimeout) { window.clearTimeout(autocompleteTimeout) }

  autocompleteTimeout = window.setTimeout(() => {
    const reqId = new Date()
    autocompleteId = reqId

    const url = path + '?q=' + encodeURIComponent(value)
    fetch(url)
      .then(req => req.json())
      .then(data => {
        if (autocompleteId === reqId) {
          callback(null, data)
        }
      })
  }, autocompleteDelay)
}
