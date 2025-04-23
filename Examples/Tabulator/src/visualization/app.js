import { TableManager } from './libraries/tableManger.js'
import React, { useEffect, useRef } from 'react'

const TabulatorApp = ({ config }) => {
  const containerRef = useRef(null)
  const tableRef = useRef(null)
  useEffect(() => {
    if (containerRef.current && tableRef.current) { return };
    const manager = new TableManager(config, containerRef)
    manager.initializeTable()
    tableRef.current = manager
  }, [config])
  return <div ref={containerRef} />
}

export default TabulatorApp
