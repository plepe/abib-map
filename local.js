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
  Array.from(div.querySelectorAll('a')).forEach(a => {
    if (a.href && a.href.substr(0, 1) !== '#') {
      a.target = '_top'
    }
  })

  tabs(div)
}

function handleSidebar (display) {
  Array.from(display.content.querySelectorAll('a')).forEach(link => {
    link.onclick = () => {
      let path = link.getAttribute('href')
      if (path.substr(0, 1) !== '/') {
        return true
      }

      display.content.innerHTML = ''

      if (app.timelineLayers && app.timelineLayers.length && app.timelineLayers[0].data) {
        const items = app.timelineLayers[0].data.filter(item => {
          return item.url === link.href
        })
        if (items.length) {
          app.state.apply({ id: items[0].id, path: null, map: 'auto' })
          app.state.updateLink(true)
          return false
        }
      }

      fetch(path)
        .then(req => req.text())
        .then(body => {
          const x = document.createElement('div')
          x.innerHTML = body

          const content = x.querySelector('#content .region')
          let shortlink = x.querySelector('link[rel=shortlink]')
          if (shortlink) {
            const m = shortlink.getAttribute('href').match(/\/node\/([0-9]+)$/)
            if (m) {
              const id = m[1]
              app.state.apply({ id, path: null, map: 'auto' })
            } else {
              shortlink = null
            }
          }

          tabs(display.content)

          if (!shortlink) {
            display.content.innerHTML = content ? content.innerHTML : ''
            display.url = path
            app.state.apply({ id: null, path })
          }

          app.state.updateLink(true)
          display.emit('ready')
        })


      return false
    }
  })

  tabs(display.content)
}
