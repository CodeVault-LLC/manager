import { ERmapType, IRmapRequest, IRmapResponse } from '@manager/common/src'
import { useState } from 'react'
import { ipcClient } from '../../../utils/ipcClient'

export const useRmap = () => {
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const [risk, setRisk] = useState<string>('all')

  const [selectedHost, setSelectedHost] = useState<string | null>(null)
  const [target, setTarget] = useState('192.168.1.0/24')
  const [type, setType] = useState<ERmapType>('quick')

  const [output, setOutput] = useState<IRmapResponse[]>([])

  const handleStartScan = async () => {
    if (loading) return
    setLoading(true)

    const dataToSend: IRmapRequest = {
      ip_addresses: [target],
      detect_services: type !== 'quick',
      full_scan: type === 'comprehensive' || type === 'aggressive'
    }

    ipcClient.on(
      'rmap:progress',
      (
        _event: any,
        data: { total: number; scanned: number; results: IRmapResponse[] }
      ) => {
        console.log('RMap progress:', data)
        setOutput(data.results)
      }
    )

    ipcClient.on('rmap:complete', (_event: any, data: IRmapResponse[]) => {
      console.log('RMap scan complete:', data)
      setOutput(data)
      setLoading(false)
    })

    void ipcClient.invoke('rmap:generate', dataToSend)
  }

  return {
    loading,
    setLoading,
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    risk,
    setRisk,
    selectedHost,
    setSelectedHost,
    target,
    setTarget,
    type,
    setType,
    output,
    setOutput,

    handleStartScan
  }
}
