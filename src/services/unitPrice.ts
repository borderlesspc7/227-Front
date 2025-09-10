import type { UnitPrice } from "../types/unitPrice";
import { db } from "../lib/firebaseconfig";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  doc,
  serverTimestamp,
} from "firebase/firestore";

export const unitPriceService = {
  async createUnitPrice(
    unitPriceData: Omit<UnitPrice, "id">
  ): Promise<UnitPrice> {
    try {
      const unitPriceRef = collection(db, "unitPrices");
      const unitPriceDoc = await addDoc(unitPriceRef, unitPriceData);
      const unitPrice = { id: unitPriceDoc.id, ...unitPriceData };
      return unitPrice;
    } catch (error) {
      console.error("Error creating unit price:", error);
      throw error;
    }
  },

  async getUnitPrices(): Promise<UnitPrice[]> {
    try {
      const unitPricesRef = collection(db, "unitPrices");
      const unitPricesDocs = await getDocs(unitPricesRef);
      const unitPrices: UnitPrice[] = [];
      unitPricesDocs.forEach((doc) => {
        const data = doc.data() as UnitPrice;
        unitPrices.push({
          id: doc.id,
          ...data,
        });
      });
      return unitPrices;
    } catch (error) {
      console.error("Error getting unit prices:", error);
      throw error;
    }
  },

  async updateUnitPrice(
    id: string,
    updateData: Omit<UnitPrice, "id">
  ): Promise<void> {
    try {
      const unitPriceRef = doc(db, "unitPrices", id);
      await updateDoc(unitPriceRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating unit price:", error);
      throw error;
    }
  },

  async deleteUnitPrice(id: string): Promise<void> {
    try {
      const unitPriceRef = doc(db, "unitPrices", id);
      await deleteDoc(unitPriceRef);
    } catch (error) {
      console.error("Error deleting unit price:", error);
      throw error;
    }
  },
};
