
import { GoogleGenAI, Type } from "@google/genai";
import type { EquipmentFilter } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const filterSchema = {
    type: Type.OBJECT,
    properties: {
        searchText: { type: Type.STRING, description: "General keywords from the query to search in name, model, or serial number." },
        equipment_type: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of equipment type codes. Valid codes: XRA, MRI, CTX, USC, MAM, DXA." },
        status: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of equipment statuses. Valid statuses: ACTIVE, MAINTENANCE, OUT_OF_SERVICE, DECOMMISSIONED." },
        manufacturer: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of manufacturer names like 'GE Healthcare', 'Siemens Healthineers', 'Philips Healthcare', etc." },
        purchase_year_min: { type: Type.INTEGER, description: "The minimum year of purchase (e.g., 2022)." },
        purchase_year_max: { type: Type.INTEGER, description: "The maximum year of purchase (e.g., 2024)." },
        maintenance_due_in_days: { type: Type.INTEGER, description: "Filter for equipment needing maintenance within the next X days from today." }
    },
};

export const getFiltersFromQuery = async (query: string): Promise<EquipmentFilter> => {
    try {
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `The user's query is: "${query}". Please generate the corresponding JSON filter.`,
            config: {
                systemInstruction: "You are an intelligent assistant for a hospital's Radiology Equipment Inventory System. Your task is to interpret a user's natural language query and convert it into a structured JSON filter object based on the provided schema. Only respond with the JSON object. Do not add any explanatory text or markdown formatting.",
                responseMimeType: "application/json",
                responseSchema: filterSchema,
            }
        });

        const jsonText = result.text.trim();
        const parsedJson = JSON.parse(jsonText);
        
        return parsedJson as EquipmentFilter;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to process natural language query.");
    }
};
