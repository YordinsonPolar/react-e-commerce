import React, { useState, useEffect } from 'react';
import "./scss/styles.scss";
import { commerce } from './lib/commerce.js';
import { BrowserRouter as Router, Switch, Route} from 'react-router-dom';

import Products from './components/Products/Products.jsx';
import Header from './components/Header/Header.jsx';
import Cart from './components/Cart/Cart.jsx';
import Checkout from './components/Checkout/Checkout.jsx';

const App = (props) => {
  const [ products, setProducts ] = useState([]);
  const [ cart, setCart ] = useState({});
  const [ order, setOrder ] = useState({});
  const [ errorMessage, setErrorMessage ] = useState('');

  const fetchProducts = async () => {
    const { data } = await commerce.products.list();
    setProducts(data);
  }

  const fetchCart = async () => {
    setCart(await commerce.cart.retrieve());
  }

  const handleAddToCart = async (productId, quantity) => {
    const { cart } = await commerce.cart.add(productId, quantity);
    setCart(cart);
  }

  const handleUpdateCartQty = async (productId, quantity) => {
    const { cart } = await commerce.cart.update(productId, { quantity });
    setCart(cart);
  }

  const handleRemoveFromCart = async (productId) => {
    const { cart } = await commerce.cart.remove(productId);
    setCart(cart);
  }

  const handleEmptyCart = async () => {
    const { cart } = await commerce.cart.empty();
    setCart(cart)
  }

  const refreshCart = async () => {
    const newCart = await commerce.cart.refresh();
    setCart(newCart);
  }

  const handleCaptureCheckout = async (checkoutTokenId, newOrder) => {
    try {
      const incomingOrder = await commerce.checkout.capture(checkoutTokenId, newOrder);
      setOrder(incomingOrder);
      refreshCart();
    }
    catch(err){
      setErrorMessage(err.data.error.message);
      // console.error(err)
    }
  }

  useEffect(() => {
    fetchProducts();
    fetchCart()
  },[])

  return (
    <Router>
      <main>
        <Header totalCartItems={cart.total_items}/>
        <Switch>
          <Route exact path="/">
            <Products products={products} onAddToCart={handleAddToCart} />
          </Route>
          <Route exact path="/checkout">
            <Checkout 
              cart={cart}
              order={order}
              onCaptureCheckout={handleCaptureCheckout}
              error={errorMessage}
               />
          </Route>
          <Route exact path="/cart" >
            <Cart 
              cart={cart}
              handleUpdateCartQty={handleUpdateCartQty}
              handleRemoveFromCart={handleRemoveFromCart}
              handleEmptyCart={handleEmptyCart}
            />
          </Route>
        </Switch>
      </main>
    </Router>
  )
}

export default App;