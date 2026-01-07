// firebase/products.ts
// Helper functions for fetching product data from Firestore
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";

export type Product = {
    id: string;
    tag: string;
    name: string;
    price: string; // keep as string to match UI formatting, e.g., "$493.00"
    category: string;
    imageUrl: string; // Maps from 'image' field in Firestore
    description?: string;
    gallery?: string[];
};

/**
 * Format price to $XXX.XX format
 * @param price - number or string price value
 * @returns formatted price string like "$493.00"
 */
function formatPrice(price: unknown): string {
    if (price === null || price === undefined) return "$0.00";

    // Convert to number
    const numPrice = typeof price === 'string'
        ? parseFloat(price.replace(/[^0-9.-]/g, ''))
        : Number(price);

    if (isNaN(numPrice)) return "$0.00";

    // Format with $ and 2 decimal places
    return `$${numPrice.toFixed(2)}`;
}

/**
 * Fetch all products from the "products" collection in Firestore.
 * Returns an array of Product objects.
 */
export async function fetchProducts(): Promise<Product[]> {
    const productsCol = collection(db, "products");
    const snapshot = await getDocs(productsCol);
    const products: Product[] = [];
    snapshot.forEach((doc) => {
        const data = doc.data();
        // Map Firestore fields to the Product type expected by the UI.
        // Note: Firestore uses 'image' field, we map it to 'imageUrl' for the UI
        products.push({
            id: doc.id,
            tag: data.tag ?? "",
            name: data.name ?? "",
            price: formatPrice(data.price), // Format as $XXX.XX
            category: data.category ?? "",
            imageUrl: data.image ?? "",
            description: data.description ?? "",
            gallery: data.gallery ?? [],
        });
    });
    return products;
}

/**
 * Fetch a single product by ID from Firestore.
 */
export async function fetchProductById(id: string): Promise<Product | null> {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            tag: data.tag ?? "",
            name: data.name ?? "",
            price: formatPrice(data.price), // Format as $XXX.XX
            category: data.category ?? "",
            imageUrl: data.image ?? "",
            description: data.description ?? "",
            gallery: data.gallery ?? [],
        };
    } else {
        return null;
    }
}
