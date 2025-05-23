import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@renderer/components/ui/tabs'
import { ExtensionList } from '@renderer/core/components/extensions/extension-list'
import { createFileRoute } from '@tanstack/react-router'

const RouteComponent = () => {
  //const { t } = useI18n()

  return (
    <>
      <Tabs defaultValue="installed" className="w-full">
        <TabsList className="w-full p-0 bg-background justify-start rounded-none border-b">
          <TabsTrigger
            value="installed"
            className="rounded-none bg-background h-full data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Installed
          </TabsTrigger>

          <TabsTrigger
            value="market"
            className="rounded-none bg-background h-full data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Marketplace
          </TabsTrigger>
        </TabsList>

        <TabsContent value="installed">
          <div className="w-full p-4">
            <ExtensionList />
          </div>
        </TabsContent>

        <TabsContent value="market">
          <div className="w-full p-4">
            <ExtensionList marketplace />
          </div>
        </TabsContent>
      </Tabs>

      <ExtensionList />
    </>
  )
}

export const Route = createFileRoute('/settings/extensions')({
  component: RouteComponent
})
