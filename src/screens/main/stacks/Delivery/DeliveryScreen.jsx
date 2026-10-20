import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  Alert,
  Platform,
  Animated,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import moment from 'moment';

import Header from '../../../../components/Header';
import {APPCOLORS} from '../../../../utils/APPCOLORS';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from '../../../../utils/Responsive';
import {
  getDeliveryCart,
  addItemToDeliveryCart,
  removeItemFromDeliveryCart,
  clearDeliveryCart,
} from '../../../../utils/DeliveryCartStorage';

// Safely require react-native-camera-kit Camera
let CameraComponent = null;
try {
  const cameraKit = require('react-native-camera-kit');
  CameraComponent = cameraKit.Camera || cameraKit.default?.Camera || null;
} catch (e) {
  CameraComponent = null;
}

const STOCK_API_URL =
  'https://e.de2solutions.com/mobile_dash/stock_master_post_api.php';
const POST_SERVICE_PURCH_SALE_URL =
  'https://e.de2solutions.com/mobile_dash/post_service_purch_sale.php';

const DeliveryScreen = ({navigation, route}) => {
  const [activeTab, setActiveTab] = useState(
    route?.params?.initialTab || 'scanner',
  ); // 'scanner' | 'cart'
  const [barcodeInput, setBarcodeInput] = useState(
    route?.params?.initialStockId || '',
  );
  const [scannedItem, setScannedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [torchOn, setTorchOn] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState('');

  // Proceed / Checkout Form State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [driverName, setDriverName] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [driverCnic, setDriverCnic] = useState('');
  const [personId, setPersonId] = useState('');
  const [poNo, setPoNo] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Scanning animation for viewfinder
  const laserAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous laser animation
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(laserAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(laserAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [laserAnim]);

  // Load persistent cart on mount and when screen is focused
  useEffect(() => {
    loadCartFromStorage();
    if (route?.params?.initialStockId) {
      fetchStockDetails(route.params.initialStockId);
    }
    const unsubscribe = navigation.addListener('focus', () => {
      loadCartFromStorage();
    });
    return unsubscribe;
  }, [navigation, route?.params?.initialStockId]);

  const loadCartFromStorage = async () => {
    const items = await getDeliveryCart();
    setCart(items);
  };

  // Fetch stock details from API
  const fetchStockDetails = async stockIdToFetch => {
    const cleanId = String(stockIdToFetch || '').trim();
    if (!cleanId) {
      Toast.show({
        type: 'error',
        text1: 'Enter Stock ID',
        text2: 'Please enter or scan a valid barcode/Stock ID',
      });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('stock_id', cleanId);

      const res = await axios.post(STOCK_API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (
        res.data?.status === 'true' &&
        Array.isArray(res.data.data) &&
        res.data.data.length > 0
      ) {
        const itemData = res.data.data[0];
        setScannedItem(itemData);
        setBarcodeInput(itemData.stock_id || cleanId);
        Toast.show({
          type: 'success',
          text1: 'Item Found',
          text2: itemData.description || `Stock ID: ${itemData.stock_id}`,
        });
      } else {
        setScannedItem(null);
        Toast.show({
          type: 'error',
          text1: 'Not Found',
          text2: `No record found for Stock ID: "${cleanId}"`,
        });
      }
    } catch (error) {
      console.error('Fetch Stock Master Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: 'Failed to fetch stock item from server.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Barcode Scanned by Camera
  const handleBarcodeRead = event => {
    const code = event?.nativeEvent?.codeStringValue || '';
    if (!code || code === lastScannedCode || loading) {
      return;
    }
    setLastScannedCode(code);
    fetchStockDetails(code);

    // Reset throttle after 3 seconds
    setTimeout(() => {
      setLastScannedCode('');
    }, 3000);
  };

  // Add Scanned Item to Persistent Cart
  const handleAddToCart = async itemToAdd => {
    if (!itemToAdd || !itemToAdd.stock_id) {
      return;
    }

    const res = await addItemToDeliveryCart(itemToAdd);
    if (res.success) {
      setCart(res.cart);
      Toast.show({
        type: 'success',
        text1: 'Added to Cart',
        text2: `${
          itemToAdd.description || itemToAdd.stock_id
        } saved to delivery cart`,
      });
    } else if (res.alreadyExists) {
      Toast.show({
        type: 'info',
        text1: 'Already In Cart',
        text2: res.message,
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: res.message || 'Could not add to cart',
      });
    }
  };

  // Remove Item from Persistent Cart
  const handleRemoveFromCart = (stockId, description) => {
    Alert.alert(
      'Remove Item',
      `Are you sure you want to remove "${description || stockId}" from cart?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const res = await removeItemFromDeliveryCart(stockId);
            if (res.success) {
              setCart(res.cart);
              Toast.show({
                type: 'info',
                text1: 'Removed',
                text2: `Item #${stockId} removed from cart`,
              });
            }
          },
        },
      ],
    );
  };

  // Clear Entire Cart
  const handleClearCart = () => {
    if (cart.length === 0) {
      return;
    }
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to clear all items from the delivery cart?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearDeliveryCart();
            setCart([]);
            Toast.show({
              type: 'info',
              text1: 'Cart Cleared',
              text2: 'All delivery items have been removed.',
            });
          },
        },
      ],
    );
  };

  // Check if current scanned item is already in cart
  const isItemInCart = stockId => {
    return cart.some(c => String(c.stock_id).trim() === String(stockId).trim());
  };

  // Laser translateY interpolation
  const laserTranslateY = laserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 170],
  });

  // Submit Order to API: post_service_purch_sale.php
  const handleProceedSubmit = async () => {
    if (cart.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Cart is Empty',
        text2: 'Please add items before proceeding.',
      });
      return;
    }

    const cleanDriverName = driverName.trim();
    const cleanVehicleNo = vehicleNo.trim();
    const cleanDriverCnic = driverCnic.trim();
    const cleanPersonId = personId.trim();
    const cleanPoNo = poNo.trim();

    if (!cleanDriverName) {
      Toast.show({
        type: 'error',
        text1: 'Required Field',
        text2: 'Please enter Driver Name.',
      });
      return;
    }
    if (!cleanVehicleNo) {
      Toast.show({
        type: 'error',
        text1: 'Required Field',
        text2: 'Please enter Vehicle Number.',
      });
      return;
    }
    if (!cleanDriverCnic) {
      Toast.show({
        type: 'error',
        text1: 'Required Field',
        text2: 'Please enter Driver CNIC.',
      });
      return;
    }
    if (!cleanPersonId) {
      Toast.show({
        type: 'error',
        text1: 'Required Field',
        text2: 'Please enter Person ID.',
      });
      return;
    }
    if (!cleanPoNo) {
      Toast.show({
        type: 'error',
        text1: 'Required Field',
        text2: 'Please enter PO Number.',
      });
      return;
    }

    try {
      setSubmittingOrder(true);
      const currentDate = moment().format('YYYY-MM-DD');
      const orderDetails = cart.map(item => ({
        item_code: String(item.stock_id || '').trim(),
        stock_id: String(item.stock_id || '').trim(),
        description: String(item.description || '').trim(),
        item_description: String(item.description || '').trim(),
        quantity: 1,
        qty: 1,
        unit_price: 0,
        price: 0,
        discount_percent: 0,
      }));

      const payload = {
        driver_name: cleanDriverName,
        vehicle_no: cleanVehicleNo,
        driver_cnic: cleanDriverCnic,
        person_id: cleanPersonId,
        po_no: cleanPoNo,
        trans_type: 13,
        ord_date: currentDate,
        purch_order_details: orderDetails,
      };

      console.log('Sending post_service_purch_sale payload:', payload);

      const res = await axios.post(POST_SERVICE_PURCH_SALE_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('post_service_purch_sale response:', res.data);

      if (res.data?.status === true || res.data?.status === 'true') {
        // Clear cart in storage and state
        await clearDeliveryCart();
        setCart([]);

        // Reset form inputs
        setDriverName('');
        setVehicleNo('');
        setDriverCnic('');
        setPersonId('');
        setPoNo('');
        setShowCheckoutModal(false);

        Toast.show({
          type: 'success',
          text1: 'Order Posted Successfully!',
          text2: `PO #${cleanPoNo} has been created.`,
        });

        Alert.alert(
          'Success',
          `Delivery Note with PO #${cleanPoNo} has been posted successfully!`,
          [
            {
              text: 'OK',
              onPress: () => {
                setActiveTab('scanner');
              },
            },
          ],
        );
      } else {
        Toast.show({
          type: 'error',
          text1: 'Submission Failed',
          text2: res.data?.message || 'Server did not accept the request.',
        });
      }
    } catch (error) {
      console.error('Post Service Purch Sale Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Submission Error',
        text2:
          error?.response?.data?.message ||
          'Failed to submit delivery note. Please check connection.',
      });
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleBack = () => {
    if (activeTab === 'cart') {
      setActiveTab('scanner');
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Dashboard');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Delivery Note"
        onBack={handleBack}
        rightElement={
          <TouchableOpacity
            style={styles.cartHeaderBtn}
            activeOpacity={0.75}
            onPress={() =>
              setActiveTab(activeTab === 'cart' ? 'scanner' : 'cart')
            }>
            <MIcon
              name={activeTab === 'cart' ? 'barcode-scan' : 'cart-outline'}
              size={22}
              color={APPCOLORS.WHITE}
            />
            {cart.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cart.length > 99 ? '99+' : cart.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        }
      />

      {/* Modern Segmented Navigation Tabs */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[
            styles.segmentBtn,
            activeTab === 'scanner' && styles.segmentBtnActive,
          ]}
          activeOpacity={0.8}
          onPress={() => setActiveTab('scanner')}>
          <MIcon
            name="barcode-scan"
            size={18}
            color={activeTab === 'scanner' ? APPCOLORS.WHITE : '#64748B'}
            style={{marginRight: 6}}
          />
          <Text
            style={[
              styles.segmentText,
              activeTab === 'scanner' && styles.segmentTextActive,
            ]}>
            Scan Barcode
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentBtn,
            activeTab === 'cart' && styles.segmentBtnActive,
          ]}
          activeOpacity={0.8}
          onPress={() => setActiveTab('cart')}>
          <MIcon
            name="cart-outline"
            size={18}
            color={activeTab === 'cart' ? APPCOLORS.WHITE : '#64748B'}
            style={{marginRight: 6}}
          />
          <Text
            style={[
              styles.segmentText,
              activeTab === 'cart' && styles.segmentTextActive,
            ]}>
            Delivery Cart ({cart.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: SCANNER */}
      {activeTab === 'scanner' && (
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollInner}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Camera Viewfinder Card */}
          <View style={styles.scannerWrapper}>
            <View style={styles.viewfinderCard}>
              {CameraComponent ? (
                <View style={styles.cameraBox}>
                  <CameraComponent
                    style={StyleSheet.absoluteFill}
                    scanBarcode={true}
                    onReadCode={handleBarcodeRead}
                    showFrame={true}
                    laserColor={APPCOLORS.Primary || '#0784B5'}
                    frameColor={APPCOLORS.Primary || '#0784B5'}
                    torchMode={torchOn ? 'on' : 'off'}
                  />
                  <TouchableOpacity
                    style={styles.torchBtn}
                    activeOpacity={0.8}
                    onPress={() => setTorchOn(!torchOn)}>
                    <MIcon
                      name={torchOn ? 'flashlight' : 'flashlight-off'}
                      size={20}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.viewfinderMock}>
                  {/* Target frame brackets */}
                  <View style={styles.viewfinderTarget}>
                    <View style={[styles.corner, styles.cornerTL]} />
                    <View style={[styles.corner, styles.cornerTR]} />
                    <View style={[styles.corner, styles.cornerBL]} />
                    <View style={[styles.corner, styles.cornerBR]} />

                    <MIcon
                      name="barcode"
                      size={60}
                      color="rgba(255,255,255,0.25)"
                      style={styles.barcodeCenterIcon}
                    />

                    {/* Animated Scanning Laser Line */}
                    <Animated.View
                      style={[
                        styles.laserLine,
                        {transform: [{translateY: laserTranslateY}]},
                      ]}
                    />
                  </View>

                  <Text style={styles.viewfinderHint}>
                    Ready to scan barcodes & stock labels
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Barcode / Stock ID Input Card */}
          <View style={styles.searchCard}>
            <Text style={styles.searchTitle}>ENTER OR SCAN STOCK ID</Text>
            <View style={styles.searchRow}>
              <View style={styles.inputBox}>
                <MIcon
                  name="barcode-scan"
                  size={20}
                  color="#64748B"
                  style={{marginRight: 8}}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter Stock ID (000001)"
                  placeholderTextColor="#94A3B8"
                  value={barcodeInput}
                  onChangeText={setBarcodeInput}
                  autoCapitalize="none"
                  returnKeyType="search"
                  onSubmitEditing={() => fetchStockDetails(barcodeInput)}
                />
                {barcodeInput.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setBarcodeInput('');
                      setScannedItem(null);
                    }}
                    style={{padding: 4}}>
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={styles.scanBtn}
                activeOpacity={0.8}
                disabled={loading}
                onPress={() => fetchStockDetails(barcodeInput)}>
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialIcons
                      name="search"
                      size={18}
                      color="#FFFFFF"
                      style={{marginRight: 4}}
                    />
                    <Text style={styles.scanBtnText}>Scan</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Quick Test Barcode Chip */}
            <View style={styles.quickTestRow}>
              <Text style={styles.quickTestLabel}>Quick Test:</Text>
              <TouchableOpacity
                style={styles.quickChip}
                activeOpacity={0.7}
                onPress={() => {
                  setBarcodeInput('000001');
                  fetchStockDetails('000001');
                }}>
                <MIcon
                  name="flash"
                  size={14}
                  color="#0284C7"
                  style={{marginRight: 3}}
                />
                <Text style={styles.quickChipText}>Stock ID: 000001</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Scanned Item Result Card */}
          {scannedItem && (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View style={styles.badgeSuccess}>
                  <MaterialIcons
                    name="check-circle"
                    size={15}
                    color="#059669"
                    style={{marginRight: 4}}
                  />
                  <Text style={styles.badgeSuccessText}>Item Verified</Text>
                </View>
                <Text style={styles.resultStockId}>
                  ID: #{scannedItem.stock_id}
                </Text>
              </View>

              <Text style={styles.resultDesc}>
                {scannedItem.description || 'No description provided'}
              </Text>

              <View style={styles.resultDivider} />

              <View style={styles.resultActionRow}>
                {isItemInCart(scannedItem.stock_id) ? (
                  <View style={styles.alreadyInCartBox}>
                    <View style={styles.inCartBadge}>
                      <MaterialIcons
                        name="done-all"
                        size={16}
                        color="#0369A1"
                        style={{marginRight: 4}}
                      />
                      <Text style={styles.inCartBadgeText}>
                        Already in Delivery Cart
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.viewCartBtn}
                      activeOpacity={0.8}
                      onPress={() => setActiveTab('cart')}>
                      <Text style={styles.viewCartBtnText}>View Cart ›</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addToCartBtn}
                    activeOpacity={0.8}
                    onPress={() => handleAddToCart(scannedItem)}>
                    <MIcon
                      name="cart-plus"
                      size={20}
                      color="#FFFFFF"
                      style={{marginRight: 8}}
                    />
                    <Text style={styles.addToCartBtnText}>Add to Cart</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Quick Info Box */}
          <View style={styles.infoBox}>
            <MIcon
              name="information-outline"
              size={18}
              color="#0784B5"
              style={{marginRight: 8, marginTop: 2}}
            />
            <Text style={styles.infoText}>
              Items added to cart are stored securely in local storage. They
              will remain saved across page refreshes and app restarts until you
              explicitly remove them.
            </Text>
          </View>
        </ScrollView>
      )}

      {/* TAB 2: CART */}
      {activeTab === 'cart' && (
        <View style={styles.cartContainer}>
          {/* Cart Header Stats & Clear Action */}
          <View style={styles.cartHeaderStats}>
            <View>
              <Text style={styles.cartStatsTitle}>
                {cart.length === 1 ? '1 Item' : `${cart.length} Items`} Saved
              </Text>
              <Text style={styles.cartStatsSubtitle}>
                Persistent Storage • Delivery Note
              </Text>
            </View>

            {cart.length > 0 && (
              <TouchableOpacity
                style={styles.clearCartBtn}
                activeOpacity={0.7}
                onPress={handleClearCart}>
                <MIcon
                  name="trash-can-outline"
                  size={16}
                  color="#DC2626"
                  style={{marginRight: 4}}
                />
                <Text style={styles.clearCartText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Cart Items List */}
          <FlatList
            data={cart}
            keyExtractor={(item, index) => `${item.stock_id}-${index}`}
            contentContainerStyle={[
              styles.cartListContent,
              cart.length > 0 && {paddingBottom: responsiveHeight(15)},
            ]}
            showsVerticalScrollIndicator={false}
            renderItem={({item, index}) => (
              <View style={styles.cartCard}>
                <View style={styles.cartCardLeft}>
                  <View style={styles.itemIndexBadge}>
                    <Text style={styles.itemIndexText}>#{index + 1}</Text>
                  </View>
                  <View style={styles.cartDetails}>
                    <View style={styles.cartStockRow}>
                      <MIcon
                        name="barcode"
                        size={16}
                        color={APPCOLORS.Primary || '#0784B5'}
                        style={{marginRight: 4}}
                      />
                      <Text style={styles.cartStockId}>
                        Stock ID: {item.stock_id}
                      </Text>
                    </View>
                    <Text style={styles.cartDescription} numberOfLines={2}>
                      {item.description || 'Stock Item'}
                    </Text>
                    {item.added_at && (
                      <Text style={styles.cartDateText}>
                        Added:{' '}
                        {moment(item.added_at).format('DD/MM/YYYY, hh:mm A')}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Delete Button */}
                <TouchableOpacity
                  style={styles.cartDeleteBtn}
                  activeOpacity={0.7}
                  onPress={() =>
                    handleRemoveFromCart(item.stock_id, item.description)
                  }>
                  <MIcon name="delete-outline" size={22} color="#EF4444" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyCartBox}>
                <View style={styles.emptyIconCircle}>
                  <MIcon name="cart-off" size={48} color="#94A3B8" />
                </View>
                <Text style={styles.emptyCartTitle}>
                  Delivery Cart is Empty
                </Text>
                <Text style={styles.emptyCartSubtitle}>
                  Scan barcodes or enter Stock IDs in the scanner tab to add
                  items to this delivery note.
                </Text>
                <TouchableOpacity
                  style={styles.startScanBtn}
                  activeOpacity={0.8}
                  onPress={() => setActiveTab('scanner')}>
                  <MIcon
                    name="barcode-scan"
                    size={18}
                    color="#FFFFFF"
                    style={{marginRight: 6}}
                  />
                  <Text style={styles.startScanBtnText}>
                    Open Barcode Scanner
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />

          {/* Proceed Button at bottom of Cart */}
          {cart.length > 0 && (
            <View style={styles.cartFooterBar}>
              <View style={styles.cartFooterLeft}>
                <Text style={styles.cartFooterCountText}>
                  {cart.length} {cart.length === 1 ? 'Item' : 'Items'} selected
                </Text>
                <Text style={styles.cartFooterSubText}>
                  Tap Proceed to finalize
                </Text>
              </View>
              <TouchableOpacity
                style={styles.proceedBtn}
                activeOpacity={0.85}
                onPress={() => setShowCheckoutModal(true)}>
                <Text style={styles.proceedBtnText}>Proceed</Text>
                <MIcon
                  name="arrow-right-circle"
                  size={20}
                  color="#FFFFFF"
                  style={{marginLeft: 8}}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* PROCEED / DELIVERY DETAILS MODAL */}
      <Modal
        visible={showCheckoutModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          if (!submittingOrder) {
            setShowCheckoutModal(false);
          }
        }}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalBackdropTouchable}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => {
                if (!submittingOrder) {
                  setShowCheckoutModal(false);
                }
              }}
            />
            <View style={styles.modalCard}>
              {/* Modal Drag Handle */}
              <View style={styles.modalHandle} />

              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={{flex: 1}}>
                  <Text style={styles.modalTitle}>Delivery Details</Text>
                  <Text style={styles.modalSubtitle}>
                    Fill in driver and order info to proceed
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  disabled={submittingOrder}
                  onPress={() => setShowCheckoutModal(false)}>
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.modalScrollContent}>
                {/* Fixed Info Tags */}
                <View style={styles.infoTagsRow}>
                  <View style={styles.infoTag}>
                    <MIcon name="calendar-today" size={12} color="#0369A1" />
                    <Text style={styles.infoTagLabel}>Date:</Text>
                    <Text style={styles.infoTagValue}>
                      {moment().format('DD-MM-YYYY')}
                    </Text>
                  </View>
                </View>

                {/* Form Field 1: Driver Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Driver Name <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <View style={styles.modalInputWrapper}>
                    <MIcon
                      name="account-outline"
                      size={20}
                      color="#64748B"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.modalTextInput}
                      placeholder="Enter driver full name"
                      placeholderTextColor="#94A3B8"
                      value={driverName}
                      onChangeText={setDriverName}
                      editable={!submittingOrder}
                    />
                  </View>
                </View>

                {/* Form Field 2: Vehicle No */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Vehicle No <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <View style={styles.modalInputWrapper}>
                    <MIcon
                      name="truck-outline"
                      size={20}
                      color="#64748B"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.modalTextInput}
                      placeholder="LES-4421"
                      placeholderTextColor="#94A3B8"
                      value={vehicleNo}
                      onChangeText={setVehicleNo}
                      autoCapitalize="characters"
                      editable={!submittingOrder}
                    />
                  </View>
                </View>

                {/* Form Field 3: Driver CNIC */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Driver CNIC <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <View style={styles.modalInputWrapper}>
                    <MIcon
                      name="card-account-details-outline"
                      size={20}
                      color="#64748B"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.modalTextInput}
                      placeholder="35201-1234567-1"
                      placeholderTextColor="#94A3B8"
                      value={driverCnic}
                      onChangeText={setDriverCnic}
                      keyboardType="numbers-and-punctuation"
                      editable={!submittingOrder}
                    />
                  </View>
                </View>

                {/* Form Field 4: Person ID */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Person ID <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <View style={styles.modalInputWrapper}>
                    <MIcon
                      name="identifier"
                      size={20}
                      color="#64748B"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.modalTextInput}
                      placeholder="Enter person ID (1)"
                      placeholderTextColor="#94A3B8"
                      value={personId}
                      onChangeText={setPersonId}
                      keyboardType="default"
                      editable={!submittingOrder}
                    />
                  </View>
                </View>

                {/* Form Field 5: PO No */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    PO No <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <View style={styles.modalInputWrapper}>
                    <MIcon
                      name="file-document-outline"
                      size={20}
                      color="#64748B"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.modalTextInput}
                      placeholder="Enter Purchase Order No (PO-9921)"
                      placeholderTextColor="#94A3B8"
                      value={poNo}
                      onChangeText={setPoNo}
                      editable={!submittingOrder}
                    />
                  </View>
                </View>

                {/* Cart Items Summary List */}
                <View style={styles.modalCartSummaryBox}>
                  <View style={styles.modalCartSummaryHeader}>
                    <MIcon name="cart-outline" size={16} color="#0784B5" />
                    <Text style={styles.modalCartSummaryTitle}>
                      Order Items ({cart.length})
                    </Text>
                  </View>
                  {cart.map((cItem, cIdx) => (
                    <View
                      key={`modal-item-${cIdx}`}
                      style={styles.modalCartItemRow}>
                      <Text style={styles.modalItemCode}>
                        #{cItem.stock_id}
                      </Text>
                      <Text style={styles.modalItemDesc} numberOfLines={1}>
                        {cItem.description || 'Stock Item'}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Submit and Cancel Buttons */}
                <View style={styles.modalActionsRow}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    activeOpacity={0.7}
                    disabled={submittingOrder}
                    onPress={() => setShowCheckoutModal(false)}>
                    <Text style={styles.modalCancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalSubmitBtn,
                      submittingOrder && {opacity: 0.8},
                    ]}
                    activeOpacity={0.8}
                    disabled={submittingOrder}
                    onPress={handleProceedSubmit}>
                    {submittingOrder ? (
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <ActivityIndicator
                          size="small"
                          color="#FFFFFF"
                          style={{marginRight: 8}}
                        />
                        <Text style={styles.modalSubmitBtnText}>
                          Submitting...
                        </Text>
                      </View>
                    ) : (
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={styles.modalSubmitBtnText}>
                          Confirm & Post
                        </Text>
                        <MIcon
                          name="check-circle-outline"
                          size={18}
                          color="#FFFFFF"
                          style={{marginLeft: 6}}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  cartHeaderBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: responsiveWidth(4),
    marginTop: responsiveHeight(1.2),
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 3,
    elevation: 2,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: APPCOLORS.Primary || '#0784B5',
    shadowColor: APPCOLORS.Primary || '#0784B5',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: {
    fontSize: responsiveFontSize(1.6),
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    paddingBottom: responsiveHeight(6),
  },
  scannerWrapper: {
    paddingHorizontal: responsiveWidth(4),
    marginTop: responsiveHeight(1.5),
  },
  viewfinderCard: {
    height: 220,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 4,
  },
  cameraBox: {
    ...StyleSheet.absoluteFillObject,
  },
  torchBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 20,
  },
  viewfinderMock: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinderTarget: {
    width: 200,
    height: 180,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: APPCOLORS.Primary || '#0784B5',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  barcodeCenterIcon: {
    alignSelf: 'center',
  },
  laserLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: '#38BDF8',
    shadowColor: '#38BDF8',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 6,
  },
  viewfinderHint: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
  },
  searchCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: responsiveWidth(4),
    marginTop: responsiveHeight(1.5),
    padding: responsiveWidth(3.5),
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  searchTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  inputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 44,
    paddingHorizontal: 12,
  },
  textInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: responsiveFontSize(1.6),
    paddingVertical: 0,
  },
  scanBtn: {
    backgroundColor: APPCOLORS.Primary || '#0784B5',
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBtnText: {
    color: '#FFFFFF',
    fontSize: responsiveFontSize(1.6),
    fontWeight: '700',
  },
  quickTestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  quickTestLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginRight: 6,
    fontWeight: '500',
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284C7',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: responsiveWidth(4),
    marginTop: responsiveHeight(1.5),
    padding: responsiveWidth(4),
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 5,
    borderLeftColor: '#10B981',
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeSuccessText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
  },
  resultStockId: {
    fontSize: responsiveFontSize(1.5),
    fontWeight: '700',
    color: '#334155',
  },
  resultDesc: {
    fontSize: responsiveFontSize(1.8),
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 24,
  },
  resultDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  resultActionRow: {
    flexDirection: 'row',
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: APPCOLORS.Primary || '#0784B5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    elevation: 2,
  },
  addToCartBtnText: {
    color: '#FFFFFF',
    fontSize: responsiveFontSize(1.7),
    fontWeight: '700',
  },
  alreadyInCartBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inCartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  inCartBadgeText: {
    color: '#0369A1',
    fontWeight: '600',
    fontSize: 13,
  },
  viewCartBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  viewCartBtnText: {
    color: APPCOLORS.Primary || '#0784B5',
    fontWeight: '700',
    fontSize: responsiveFontSize(1.6),
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    marginHorizontal: responsiveWidth(4),
    marginTop: responsiveHeight(1.5),
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#0369A1',
    lineHeight: 18,
  },
  cartContainer: {
    flex: 1,
  },
  cartHeaderStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(1.2),
  },
  cartStatsTitle: {
    fontSize: responsiveFontSize(1.8),
    fontWeight: '700',
    color: '#0F172A',
  },
  cartStatsSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  clearCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  clearCartText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  cartListContent: {
    paddingHorizontal: responsiveWidth(4),
    paddingBottom: responsiveHeight(6),
  },
  cartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    borderLeftColor: APPCOLORS.Primary || '#0784B5',
    elevation: 2,
  },
  cartCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIndexBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemIndexText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  cartDetails: {
    flex: 1,
  },
  cartStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  cartStockId: {
    fontSize: 12,
    fontWeight: '700',
    color: APPCOLORS.Primary || '#0784B5',
  },
  cartDescription: {
    fontSize: responsiveFontSize(1.65),
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 20,
  },
  cartDateText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  cartDeleteBtn: {
    padding: 8,
    marginLeft: 10,
  },
  emptyCartBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: responsiveHeight(8),
    paddingHorizontal: 30,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyCartTitle: {
    fontSize: responsiveFontSize(2),
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  emptyCartSubtitle: {
    fontSize: responsiveFontSize(1.5),
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  startScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APPCOLORS.Primary || '#0784B5',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  startScanBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: responsiveFontSize(1.6),
  },

  // Cart Bottom Footer & Proceed Button
  cartFooterBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: responsiveWidth(5),
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  cartFooterLeft: {
    flex: 1,
  },
  cartFooterCountText: {
    fontSize: responsiveFontSize(1.85),
    fontWeight: '800',
    color: '#0F172A',
  },
  cartFooterSubText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  proceedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APPCOLORS.Primary || '#0784B5',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
    shadowColor: APPCOLORS.Primary || '#0784B5',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  proceedBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: responsiveFontSize(1.8),
  },

  // Proceed / Delivery Details Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalBackdropTouchable: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? responsiveHeight(3) : 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -6},
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 12,
  },
  modalHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: responsiveFontSize(2.2),
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollContent: {
    paddingHorizontal: responsiveWidth(5),
    paddingTop: 14,
    paddingBottom: 24,
  },
  infoTagsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoTag: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  infoTagLabel: {
    fontSize: 10,
    color: '#0369A1',
    marginLeft: 3,
    fontWeight: '500',
  },
  infoTagValue: {
    fontSize: 10,
    color: '#0C4A6E',
    fontWeight: '700',
    marginLeft: 2,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: responsiveFontSize(1.5),
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  requiredStar: {
    color: '#EF4444',
    fontWeight: '700',
  },
  modalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  modalTextInput: {
    flex: 1,
    fontSize: responsiveFontSize(1.6),
    color: '#0F172A',
    height: '100%',
  },
  modalCartSummaryBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    marginTop: 4,
    marginBottom: 16,
  },
  modalCartSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalCartSummaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0784B5',
    marginLeft: 6,
  },
  modalCartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
  modalItemCode: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    width: 75,
  },
  modalItemDesc: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
  },
  modalActionsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalCancelBtnText: {
    fontSize: responsiveFontSize(1.6),
    fontWeight: '700',
    color: '#475569',
  },
  modalSubmitBtn: {
    flex: 2,
    backgroundColor: APPCOLORS.Primary || '#0784B5',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: APPCOLORS.Primary || '#0784B5',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  modalSubmitBtnText: {
    fontSize: responsiveFontSize(1.7),
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default DeliveryScreen;
