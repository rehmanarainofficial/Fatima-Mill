import AsyncStorage from '@react-native-async-storage/async-storage';

export const DELIVERY_CART_STORAGE_KEY = '@delivery_note_cart_items';

/**
 * Fetch all cart items from persistent storage
 */
export const getDeliveryCart = async () => {
  try {
    const raw = await AsyncStorage.getItem(DELIVERY_CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error fetching delivery cart from storage:', error);
    return [];
  }
};

/**
 * Save all cart items to persistent storage
 */
export const saveDeliveryCart = async items => {
  try {
    const dataToSave = Array.isArray(items) ? items : [];
    await AsyncStorage.setItem(
      DELIVERY_CART_STORAGE_KEY,
      JSON.stringify(dataToSave),
    );
    return true;
  } catch (error) {
    console.error('Error saving delivery cart to storage:', error);
    return false;
  }
};

/**
 * Add an item to delivery cart (avoid duplicate stock_id)
 */
export const addItemToDeliveryCart = async item => {
  try {
    const current = await getDeliveryCart();
    const existingIndex = current.findIndex(
      i => String(i.stock_id).trim() === String(item.stock_id).trim(),
    );

    if (existingIndex !== -1) {
      return {
        success: false,
        alreadyExists: true,
        message: `Item #${item.stock_id} is already in the cart.`,
        cart: current,
      };
    }

    const newItem = {
      stock_id: String(item.stock_id || '').trim(),
      description: String(item.description || '').trim(),
      added_at: new Date().toISOString(),
    };

    const updated = [newItem, ...current];
    await saveDeliveryCart(updated);
    return {
      success: true,
      alreadyExists: false,
      message: `Item #${item.stock_id} added to cart.`,
      cart: updated,
    };
  } catch (error) {
    console.error('Error adding item to delivery cart:', error);
    return {
      success: false,
      message: 'Failed to add item to storage.',
      cart: [],
    };
  }
};

/**
 * Remove an item by stock_id
 */
export const removeItemFromDeliveryCart = async stockId => {
  try {
    const current = await getDeliveryCart();
    const updated = current.filter(
      i => String(i.stock_id).trim() !== String(stockId).trim(),
    );
    await saveDeliveryCart(updated);
    return {
      success: true,
      cart: updated,
    };
  } catch (error) {
    console.error('Error removing item from delivery cart:', error);
    return {
      success: false,
      cart: [],
    };
  }
};

/**
 * Clear all items from delivery cart
 */
export const clearDeliveryCart = async () => {
  try {
    await AsyncStorage.removeItem(DELIVERY_CART_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing delivery cart:', error);
    return false;
  }
};

export default {
  getDeliveryCart,
  saveDeliveryCart,
  addItemToDeliveryCart,
  removeItemFromDeliveryCart,
  clearDeliveryCart,
};
