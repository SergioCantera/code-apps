import {Link} from "wouter";
import {Button} from "@/components/ui/button";
import {useT} from "@/lib/i18n"; 

export default function TestPage() {
  const {t} = useT()

  return (
    <div className="min-h-full grid place-items-center">
      <div className="w-full max-w-7xl px-8 text-center flex flex-col items-center space-y-6">
        <h1 className="text-5xl leading-tight tracking-tight">{t.test.heading}</h1>
        <p className="text-muted-foreground">{t.test.description}</p>
        <Button variant="outline" className="mt-4">
          <Link href="/">{t.common.backToHome}</Link>
        </Button>
      </div>
    </div>
  );
}