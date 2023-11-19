window.addEventListener('load', () => {
  window.setTimeout(() => {
    window.app.on('popup-open', handlePopup)
  }, 0)
})

function handlePopup (div) {
  Array.from(div.querySelectorAll('div.horizontal-tabs')).forEach(d => {
    const header = d.querySelector('ul.horizontal-tabs-list')
    const panesParent = d.querySelector('div[data-horizontal-tabs-panes]')
    const panes = []

    Array.from(panesParent.children).forEach(p => {
      if (p.nodeName === 'DETAILS') {
        panes.push(p)
        const li = document.createElement('li')
        const a = document.createElement('a')
        a.href = '#'
        a.onclick = () => {
          panes.forEach(p1 => {
            p1.removeAttribute('open')
          })
          p.setAttribute('open', 'open')
          return false
        }
        a.innerHTML = p.querySelector('summary').innerHTML

        li.appendChild(a)
        header.appendChild(li)
      }
    })
  })
}
