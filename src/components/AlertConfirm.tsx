import React from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface AlertConfirmProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "destructive" | "default";
}

export function AlertConfirm({
    isOpen,
    onOpenChange,
    onConfirm,
    title = "Você tem certeza?",
    description = "Esta ação não pode ser desfeita.",
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    variant = "destructive",
}: AlertConfirmProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-[400px] rounded-3xl p-6">
                <AlertDialogHeader className="flex flex-col items-center gap-4 text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${variant === "destructive" ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"
                        }`}>
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <AlertDialogTitle className="text-2xl font-bold tracking-tight">
                            {title}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground text-base">
                            {description}
                        </AlertDialogDescription>
                    </div>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-3 mt-6">
                    <AlertDialogCancel className="w-full sm:flex-1 h-12 rounded-xl bg-muted/50 border-none hover:bg-muted font-semibold transition-all">
                        {cancelLabel}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className={`w-full sm:flex-1 h-12 rounded-xl font-bold shadow-lg transition-all ${variant === "destructive"
                                ? "bg-red-600 hover:bg-red-700 shadow-red-200"
                                : "bg-primary hover:bg-primary/90 shadow-primary/20"
                            }`}
                    >
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
