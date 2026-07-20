import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PdfViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storagePath: string | null;
  title: string;
}

export function PdfViewerDialog({ open, onOpenChange, storagePath, title }: PdfViewerDialogProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setSignedUrl(null);
      setLoading(false);
      return;
    }
    if (!storagePath) {
      toast.error("Não foi possível carregar o PDF.");
      onOpenChange(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setSignedUrl(null);
    (async () => {
      try {
        const { data, error } = await supabase.storage
          .from("atestados-pdfs")
          .createSignedUrl(storagePath, 120);
        if (cancelled) return;
        if (error || !data?.signedUrl) {
          toast.error("Não foi possível carregar o PDF.");
          onOpenChange(false);
          return;
        }
        setSignedUrl(data.signedUrl);
      } catch {
        if (!cancelled) {
          toast.error("Não foi possível carregar o PDF.");
          onOpenChange(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, storagePath, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 bg-muted">
          {loading || !signedUrl ? (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <iframe
              src={signedUrl}
              width="100%"
              height="100%"
              style={{ border: "none" }}
              title={title}
            />
          )}
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          {signedUrl ? (
            <a href={signedUrl} download target="_blank" rel="noopener noreferrer">
              <Button>Baixar PDF</Button>
            </a>
          ) : (
            <Button disabled>Baixar PDF</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}