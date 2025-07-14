// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import { useState } from "react";
import { Printer, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

interface PrintFriendlyProps {
  title: string;
  author?: string;
  date?: string;
  url: string;
  contentSelector?: string;
}

export function PrintFriendly({
  title,
  author = "Lorenzo Scaturchio",
  date,
  url,
  contentSelector = "#blog-content",
}: PrintFriendlyProps): JSX.Element {
  const [isPrinting, setIsPrinting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    
    try {
      // Create a new window for print preview
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast({
          title: "Error",
          description: "Could not open print preview. Please check your popup blocker settings.",
          variant: "destructive",
        });
        setIsPrinting(false);
        return;
      }
      
      // Get the content to print
      const contentElement = document.querySelector(contentSelector);
      if (!contentElement) {
        toast({
          title: "Error",
          description: `Could not find content with selector: ${contentSelector}`,
          variant: "destructive",
        });
        printWindow.close();
        setIsPrinting(false);
        return;
      }
      
      // Clone content to avoid modifying the original
      const contentClone = contentElement.cloneNode(true) as HTMLElement;
      
      // Clean up the cloned content
      const images = contentClone.querySelectorAll("img");
      images.forEach((img) => {
        // Ensure images have absolute URLs
        if (img.src.startsWith("/")) {
          img.src = `${window.location.origin}${img.src}`;
        }
        // Add max-width for images
        img.style.maxWidth = "100%";
        img.style.height = "auto";
      });
      
      // Remove non-printable elements
      const nonPrintableElements = contentClone.querySelectorAll(".non-printable, button, [role='button']");
      nonPrintableElements.forEach((el) => el.remove());
      
      // Format date if provided
      const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }) : "";
      
      // Construct print-friendly HTML
      const printHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title} - Print Version</title>
          <style>
            @media print {
              @page {
                margin: 1.5cm;
              }
            }
            body {
              font-family: Georgia, serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 1.5rem;
            }
            .article-header {
              margin-bottom: 2rem;
              padding-bottom: 1rem;
              border-bottom: 1px solid #ddd;
            }
            h1 {
              font-size: 2rem;
              margin-bottom: 0.5rem;
            }
            .meta {
              color: #666;
              font-size: 0.9rem;
              margin-bottom: 1rem;
            }
            img {
              max-width: 100%;
              height: auto;
              margin: 1.5rem 0;
            }
            pre, code {
              background-color: #f5f5f5;
              border-radius: 3px;
              padding: 0.2rem 0.4rem;
              font-family: "Courier New", monospace;
              overflow: auto;
            }
            pre {
              padding: 1rem;
              margin: 1.5rem 0;
            }
            pre code {
              background-color: transparent;
              padding: 0;
            }
            blockquote {
              border-left: 4px solid #ddd;
              padding-left: 1rem;
              margin-left: 0;
              color: #666;
            }
            a {
              color: #333;
              text-decoration: underline;
            }
            .footer {
              margin-top: 2rem;
              padding-top: 1rem;
              border-top: 1px solid #ddd;
              font-size: 0.8rem;
              color: #666;
            }
            .no-print {
              display: none;
            }
            @media print {
              .no-print {
                display: none !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="article-header">
            <h1>${title}</h1>
            <div class="meta">
              ${author ? `By ${author}` : ""}
              ${formattedDate ? ` • ${formattedDate}` : ""}
            </div>
            <div class="source no-print">
              <p>Source: <a href="${url}">${url}</a></p>
              <button onclick="window.print()" style="padding: 6px 12px; cursor: pointer;">Print this page</button>
            </div>
          </div>
          <div class="article-content">
            ${contentClone.innerHTML}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Lorenzo Scaturchio. This article was printed from <a href="${url}">${url}</a></p>
          </div>
          <script>
            window.onload = function() {
              // Auto-print if in print mode
              if (window.matchMedia('print').matches) {
                window.print();
              }
            };
          </script>
        </body>
        </html>
      `;
      
      // Write to the new window and print
      printWindow.document.open();
      printWindow.document.write(printHTML);
      printWindow.document.close();
      
      // Close dialog after print is initiated
      setDialogOpen(false);
      
      // Wait for window to load before printing
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          setIsPrinting(false);
        }, 500);
      };
    } catch (error) {
      console.error("Print error:", error);
      toast({
        title: "Error",
        description: "An error occurred while preparing the print version.",
        variant: "destructive",
      });
      setIsPrinting(false);
    }
  };

  const handleGeneratePDF = () => {
    toast({
      title: "Coming Soon",
      description: "PDF generation will be available in a future update.",
    });
    setDialogOpen(false);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          <span>Print</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Print Options</DialogTitle>
          <DialogDescription>
            Choose how you would like to print or save this article.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button 
            onClick={handlePrint} 
            disabled={isPrinting}
            className="flex items-center justify-start gap-3"
          >
            <Printer className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Print Article</div>
              <div className="text-xs text-stone-400">Open printer-friendly version</div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            onClick={handleGeneratePDF}
            className="flex items-center justify-start gap-3"
          >
            <FileText className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">Generate PDF</div>
              <div className="text-xs text-stone-400">Download article as PDF (Coming Soon)</div>
            </div>
          </Button>
        </div>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <div className="text-xs text-stone-500">
            Print formatting is optimized for readability
          </div>
          <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
