import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { LostItem, LostItemStatus, PaymentStatus } from '../types';

const LOST_ITEMS_COLLECTION = 'lostItems';

/**
 * Create a new lost item report
 */
export const createLostItem = async (
  itemData: Omit<LostItem, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'paymentStatus'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, LOST_ITEMS_COLLECTION), {
      ...itemData,
      status: 'pending' as LostItemStatus,
      paymentStatus: 'unpaid' as PaymentStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating lost item:', error);
    throw new Error('Failed to create lost item report');
  }
};

/**
 * Upload photos to Firebase Storage
 */
export const uploadItemPhotos = async (
  itemId: string,
  files: File[]
): Promise<string[]> => {
  try {
    const uploadPromises = files.map(async (file, index) => {
      const storageRef = ref(storage, `lost-items/${itemId}/photo-${index}-${Date.now()}`);
      await uploadBytes(storageRef, file);
      return getDownloadURL(storageRef);
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading photos:', error);
    throw new Error('Failed to upload photos');
  }
};

/**
 * Get a single lost item by ID
 */
export const getLostItem = async (itemId: string): Promise<LostItem | null> => {
  try {
    const docRef = doc(db, LOST_ITEMS_COLLECTION, itemId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as LostItem;
    }
    return null;
  } catch (error) {
    console.error('Error getting lost item:', error);
    throw new Error('Failed to fetch lost item');
  }
};

/**
 * Get all lost items (admin function)
 */
export const getAllLostItems = async (): Promise<LostItem[]> => {
  try {
    const q = query(
      collection(db, LOST_ITEMS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as LostItem[];
  } catch (error) {
    console.error('Error getting lost items:', error);
    throw new Error('Failed to fetch lost items');
  }
};

/**
 * Get lost items by user ID
 */
export const getUserLostItems = async (userId: string): Promise<LostItem[]> => {
  try {
    const q = query(
      collection(db, LOST_ITEMS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as LostItem[];
  } catch (error) {
    console.error('Error getting user lost items:', error);
    throw new Error('Failed to fetch your lost items');
  }
};

/**
 * Update lost item status
 */
export const updateLostItemStatus = async (
  itemId: string,
  status: LostItemStatus
): Promise<void> => {
  try {
    const docRef = doc(db, LOST_ITEMS_COLLECTION, itemId);
    const updateData: any = {
      status,
      updatedAt: serverTimestamp()
    };

    if (status === 'recovered') {
      updateData.recoveredAt = serverTimestamp();
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating lost item status:', error);
    throw new Error('Failed to update item status');
  }
};

/**
 * Update payment status
 */
export const updatePaymentStatus = async (
  itemId: string,
  paymentStatus: PaymentStatus
): Promise<void> => {
  try {
    const docRef = doc(db, LOST_ITEMS_COLLECTION, itemId);
    await updateDoc(docRef, {
      paymentStatus,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw new Error('Failed to update payment status');
  }
};

/**
 * Assign detectorist to lost item
 */
export const assignDetectorist = async (
  itemId: string,
  detectoristId: string,
  detectoristName: string
): Promise<void> => {
  try {
    const docRef = doc(db, LOST_ITEMS_COLLECTION, itemId);
    await updateDoc(docRef, {
      assignedTo: detectoristId,
      assignedToName: detectoristName,
      status: 'assigned',
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error assigning detectorist:', error);
    throw new Error('Failed to assign detectorist');
  }
};

/**
 * Add recovery notes and photos
 */
export const addRecoveryDetails = async (
  itemId: string,
  notes: string,
  photos: string[]
): Promise<void> => {
  try {
    const docRef = doc(db, LOST_ITEMS_COLLECTION, itemId);
    await updateDoc(docRef, {
      recoveryNotes: notes,
      recoveryPhotos: photos,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding recovery details:', error);
    throw new Error('Failed to add recovery details');
  }
};
