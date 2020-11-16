import React, {useState, useEffect, useRef, useCallback} from 'react'
import PropTypes from 'prop-types'
import {basename} from 'path'
import dynamic from 'next/dynamic'
import css from './style.css'

const AceEditor = dynamic(
  async () => {
    const reactAce = await import('react-ace')

    await import('ace-builds/src-min-noconflict/ext-language_tools')

    await import('ace-builds/src-min-noconflict/mode-plain_text')
    await import('ace-builds/src-min-noconflict/mode-markdown')
    await import('ace-builds/src-min-noconflict/mode-javascript')
    await import('ace-builds/src-min-noconflict/mode-json')

    await import('ace-builds/src-min-noconflict/theme-textmate')

    const ace = await import('ace-builds/src-min-noconflict/ace')
    ace.config.set('basePath', 'ace-builds/src-min-noconflict/')

    return reactAce
  },
  {ssr: false},
)

function PlaintextEditor({file, write}) {
  const [fileName, setFileName] = useState('')
  const [contents, setContents] = useState('')
  const [mode, setMode] = useState('')
  const [width, setWidth] = useState(null)

  const ref = useRef(null)

  const getMode = (fileType) => {
    if (fileType == 'text/plain') return 'plain_text'
    if (fileType == 'text/markdown') return 'markdown'
    if (fileType == 'text/javascript') return 'javascript'
    if (fileType == 'application/json') return 'json'
  }

  useEffect(() => {
    setMode(getMode(file.type))
    setFileName(basename(file.name))
    file.text().then(setContents)
  })

  const updateWidth = useCallback(() => {
    if (ref && ref.current) {
      const {width} = ref.current.getBoundingClientRect()
      setWidth(width + 'px')
    }
  }, [ref])

  useEffect(() => {
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [updateWidth])

  return (
    <div ref={ref} className={css.editor}>
      <div className={css.title}>{fileName}</div>
      <AceEditor
        value={contents}
        fontSize={15}
        width={width}
        wrapEnabled={true}
        mode={mode}
        theme="textmate"
        setOptions={{useWorker: false}}
      />
    </div>
  )
}

PlaintextEditor.propTypes = {
  file: PropTypes.object,
  write: PropTypes.func,
}

export default PlaintextEditor
