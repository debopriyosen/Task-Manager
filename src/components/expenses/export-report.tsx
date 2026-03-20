"use client";

import { Download } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Expense } from "@/contexts/ExpensesContext";
import { useState } from "react";

interface ExportReportButtonProps {
    expenses: Expense[];
    filterMonth: string;
}

export function ExportReportButton({ expenses, filterMonth }: ExportReportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            
            // Dynamically import jspdf and jspdf-autotable to keep the initial client bundle small
            const { default: jsPDF } = await import("jspdf");
            const { default: autoTable } = await import("jspdf-autotable");

            const doc = new jsPDF();
            
            // Title
            doc.setFontSize(22);
            doc.setTextColor(30, 58, 138); // Indigo 900
            doc.text("Planora Financial Report", 14, 22);

            // Subtitle / Date range
            doc.setFontSize(11);
            doc.setTextColor(100, 116, 139); // Slate 500
            const reportPeriod = filterMonth === "All" ? "All Time" : format(parseISO(`${filterMonth}-01`), "MMMM yyyy");
            doc.text(`Report Period: ${reportPeriod}`, 14, 30);
            doc.text(`Generated on: ${format(new Date(), "PPpp")}`, 14, 36);

            // Summary Stats
            const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
            
            doc.setFontSize(14);
            doc.setTextColor(15, 23, 42); // Slate 900
            doc.text(`Total Expenses: ₹${totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 14, 48);
            doc.text(`Total Transactions: ${expenses.length}`, 14, 55);

            // Add Table
            const tableData = expenses.map(e => [
                format(parseISO(e.date), "MMM d, yyyy"),
                e.category,
                e.notes || "-",
                `₹${e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
            ]);

            autoTable(doc, {
                startY: 65,
                head: [['Date', 'Category', 'Notes', 'Amount']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [79, 70, 229] }, // Indigo 600
                columnStyles: {
                    3: { halign: 'right' }
                },
            });

            // Save PDF
            const filename = `Planora_Report_${filterMonth.replace("-", "_")}.pdf`;
            doc.save(filename);

        } catch (error) {
            console.error("Failed to export PDF", error);
            alert("Failed to generate PDF. Check console for details.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={isExporting || expenses.length === 0}
            className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap active:scale-95"
            title="Download PDF Report"
        >
            <Download size={16} className={isExporting ? "animate-bounce text-indigo-500" : ""} />
            <span>{isExporting ? "Generating..." : "Export PDF"}</span>
        </button>
    );
}
