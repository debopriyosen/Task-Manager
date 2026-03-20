import { format, subDays, addDays } from "date-fns";
import { ExpenseCategory } from "@/contexts/ExpensesContext";

export interface ParsedExpense {
    amount: number | null;
    category: ExpenseCategory | null;
    date: string | null;
    notes: string;
}

const CATEGORY_KEYWORDS: Record<ExpenseCategory, string[]> = {
    Groceries: ["grocery", "groceries", "supermarket", "mart", "vegetables", "milk", "fruits"],
    Food: ["food", "lunch", "dinner", "breakfast", "restaurant", "cafe", "coffee", "swiggy", "zomato", "eat", "pizza", "burger", "meal"],
    Entertainment: ["movie", "cinema", "game", "party", "netflix", "prime", "concert", "entertainment", "fun", "show"],
    Travel: ["travel", "flight", "train", "bus", "cab", "uber", "ola", "rickshaw", "auto", "metro", "fuel", "petrol", "gas", "ticket"],
    Investment: ["investment", "stock", "mutual fund", "crypto", "sip", "fd", "savings"],
    Bills: ["bill", "electricity", "water", "internet", "wifi", "rent", "recharge", "phone", "mobile", "electric"],
    Shopping: ["shopping", "clothes", "shoes", "shirt", "pant", "dress", "amazon", "flipkart", "myntra", "buy"],
    Others: []
};

export function parseExpenseVoiceInput(transcript: string): ParsedExpense {
    const lowerText = transcript.trim().toLowerCase();
    
    // Extract Amount (matches first number found)
    const amountMatch = lowerText.match(/\d+(\.\d{1,2})?/);
    const amount = amountMatch ? parseFloat(amountMatch[0]) : null;

    // Extract Category by matching keywords
    let category: ExpenseCategory | null = null;
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(kw => lowerText.includes(kw))) {
            category = cat as ExpenseCategory;
            break;
        }
    }

    // Extract Date (relative)
    let date: string | null = null;
    const today = new Date();
    
    if (lowerText.includes("day before yesterday")) {
        date = format(subDays(today, 2), "yyyy-MM-dd");
    } else if (lowerText.includes("yesterday")) {
        date = format(subDays(today, 1), "yyyy-MM-dd");
    } else if (lowerText.includes("tomorrow")) {
        date = format(addDays(today, 1), "yyyy-MM-dd");
    } else {
        // Default to today if nothing explicitly mentioned, or if "today" is mentioned
        date = format(today, "yyyy-MM-dd");
    }

    // Capitalize the first letter of notes for better presentation
    const notes = transcript.trim();
    const formattedNotes = notes.length > 0 ? notes.charAt(0).toUpperCase() + notes.slice(1) : "";

    return {
        amount,
        category,
        date,
        notes: formattedNotes
    };
}
