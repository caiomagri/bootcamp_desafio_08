import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storagedProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (storagedProducts) {
        setProducts(JSON.parse(storagedProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async ({ id, image_url, price, title }: Omit<Product, 'quantity'>) => {
      const newProducts: Product[] = products;
      const index = newProducts.findIndex(item => item.id === id);

      if (index >= 0) {
        newProducts[index] = {
          id,
          image_url,
          price,
          title,
          quantity: newProducts[index].quantity + 1,
        };
      } else {
        newProducts.push({ id, image_url, price, title, quantity: 1 });
      }

      setProducts([...newProducts]);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const index = products.findIndex(item => item.id === id);

      if (index >= 0) {
        const newProducts = products;
        const { image_url, price, title, quantity } = newProducts[index];
        newProducts[index] = {
          id,
          image_url,
          price,
          title,
          quantity: quantity + 1,
        };
        setProducts([...newProducts]);
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(newProducts),
        );
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const index = products.findIndex(item => item.id === id);

      if (index >= 0) {
        const newProducts = products;
        const { image_url, price, title, quantity } = newProducts[index];
        newProducts[index] = {
          id,
          image_url,
          price,
          title,
          quantity: quantity - 1 > 0 ? quantity - 1 : quantity,
        };
        setProducts([...newProducts]);
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(newProducts),
        );
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
