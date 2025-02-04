const ansiToHtml = (ansiString) =>  {
  const ansiRegex = /\x1b\[[0-9;]*m/g;
  const colors = {
    '30': 'black', '31': 'red', '32': 'greenyellow', '33': 'yellow', '34': 'deepskyblue',
    '35': 'magenta', '36': 'cyan', '37': 'white', '39': 'inherit', '40': 'black',
    '41': 'red', '42': 'greenyellow', '43': 'yellow', '44': 'deepskyblue', '45': 'magenta',
    '46': 'cyan', '47': 'white'
  }

  const format = (match) => {
    const codes = match.slice(2, -1).split(';')
    let style = '';
    for (const code of codes) {
      if (code in colors) {
        style += `color: ${colors[code]};`
      } else if (code === '1') {
        style += `font-weight: bold;`
      } else if (code === '4') {
        style += `text-decoration: underline;`
      }
    }
    return style ? `<span style="${style}">` : ''
  }

  return `${ansiString.replace(ansiRegex, format)}</span>`
}

const isElectronAvailable = () => Boolean(window.electronAPI)

export { ansiToHtml, isElectronAvailable }
