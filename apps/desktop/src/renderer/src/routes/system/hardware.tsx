import { useSystemStore } from '@renderer/core/store/system.store'
import { createFileRoute, useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'

import { Table, TableBody, TableCell, TableRow, Separator } from '@manager/ui'

export const Route = createFileRoute('/system/hardware')({
  component: RouteComponent
})

function RouteComponent() {
  const { pathname } = useLocation()
  const { hardware, getSystemHardware } = useSystemStore()

  useEffect(() => {
    getSystemHardware()
  }, [pathname])

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold">System Hardware</h1>
      <Separator className="my-4" />

      <Table>
        <TableBody>
          <TableRow>
            <TableCell>CPU</TableCell>
            <TableCell>{hardware?.cpu.brand}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell>CPU Cores</TableCell>
            <TableCell>{hardware?.cpu.cores}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell>CPU Speed</TableCell>
            <TableCell>{hardware?.cpu.speed} GHz</TableCell>
          </TableRow>

          <TableRow>
            <TableCell>RAM</TableCell>
            <TableCell>{hardware?.memory.total} GB</TableCell>
          </TableRow>

          <TableRow>
            <TableCell>RAM Free</TableCell>
            <TableCell>{hardware?.memory.free} GB</TableCell>
          </TableRow>

          <TableRow>
            <TableCell>RAM Used</TableCell>
            <TableCell>{hardware?.memory.used} GB</TableCell>
          </TableRow>

          <TableRow>
            <TableCell>OS</TableCell>
            <TableCell>{hardware?.os.platform}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell>OS Arch</TableCell>
            <TableCell>{hardware?.os.arch}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell>OS Release</TableCell>
            <TableCell>{hardware?.os.release}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell>GPU</TableCell>
            <TableCell>{hardware?.graphics[0].model}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell>GPU Manufacturer</TableCell>
            <TableCell>{hardware?.graphics[0].manufacturer}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell>GPU Memory</TableCell>
            <TableCell>{hardware?.graphics[0].memory} MB</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
