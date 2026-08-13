import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Printer, Loader2 } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import SpkPdfDocument from "./SpkPdfDocument";
import { parseSpkDataForPdf } from "@karunia/shared";

interface SpkActionsProps {
    data: any;
    onEdit: (data: any) => void;
}

export default function SpkActionsNew({ data, onEdit }: SpkActionsProps) {
    const [printing, setPrinting] = useState(false);

    const handlePrint = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (printing) return;

        setPrinting(true);
        try {
            
            const parsedData = parseSpkDataForPdf(data);
            
            
            const blob = await pdf(<SpkPdfDocument data={parsedData} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            // Dashboard format: SPK_5Q290_SPK_VIII_2026.pdf
            const spkNo = parsedData?.noSPK || data?.no_spk || 'DOC';
            const safeFileName = spkNo.replace(/\//g, '_');
            link.download = `SPK_${safeFileName}.pdf`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            alert("Terjadi kesalahan pada sistem, silakan hubungi tim IT.");
        } finally {
            setPrinting(false);
        }
    };

    const isEditable = data.finish === false && data.editable === true;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {isEditable && (
                    <DropdownMenuItem onClick={() => onEdit(data)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Order
                    </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={handlePrint} disabled={printing}>
                    {printing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Printer className="mr-2 h-4 w-4" />
                    )}
                    Print Order
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
