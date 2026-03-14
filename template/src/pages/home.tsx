import { useState } from "react"
import powerAppsLogo from "/power-apps.svg"
import reactLogo from "@/assets/react.svg"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import {useT} from "@/lib/i18n"

export default function HomePage() {
  const [count, setCount] = useState(0)
  const {t} = useT()

  return (
    <div className="h-full grid place-items-center">
      <div className="w-full max-w-7xl px-8 text-center flex flex-col items-center space-y-6">

        <div className="flex items-center justify-center space-x-8">
          <a href="https://github.com/microsoft/PowerAppsCodeApps" target="_blank" rel="noreferrer noopener">
            <img
              src={powerAppsLogo}
              className="h-24 w-24 transition-transform hover:scale-105"
              alt="Power Apps logo"
            />
          </a>
          <a href="https://react.dev" target="_blank" rel="noreferrer noopener">
            <img
              src={reactLogo}
              className="h-24 w-24 transition-transform hover:scale-105 motion-safe:animate-[spin_20s_linear_infinite]"
              alt="React logo"
            />
          </a>
        </div>

        <h1 className="text-5xl leading-tight tracking-tight">{t.home.heading}</h1>

        <Card>
          <CardContent className="flex flex-col items-center space-y-4">
            <Button variant="outline" onClick={() => setCount((c) => c + 1)}>
              count is {count}
            </Button>
            <p className="text-sm text-muted-foreground">
              Edit <code className="text-foreground">src/App.tsx</code> and save to test HMR
            </p>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" onClick={() => toast.info(t.home.toast.infoHome)}>
            !
          </Button>
        </div>

        <p className="text-muted-foreground text-sm">
          {t.home.subHeading}
        </p>
      </div>
    </div>
  )
}