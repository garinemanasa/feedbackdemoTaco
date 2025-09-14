// src/App.js - Web Version for Quick Testing
import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import './App.css';

const FOOD_TRUCK_MENU = [
  {
    id: 1,
    name: 'Classic Burger',
    price: 12.99,
    category: 'burgers',
    description: 'Beef patty, lettuce, tomato, onion, pickles',
    keywords: ['burger', 'classic', 'beef']
  },
  {
    id: 2,
    name: 'Chicken Tacos',
    price: 9.99,
    category: 'tacos',
    description: 'Grilled chicken, cilantro, onions, lime',
    keywords: ['taco', 'tacos', 'chicken']
  },
  {
    id: 3,
    name: 'Fish & Chips',
    price: 14.99,
    category: 'seafood',
    description: 'Beer battered cod, crispy fries, tartar sauce',
    keywords: ['fish', 'chips', 'cod', 'fries']
  },
  {
    id: 4,
    name: 'Veggie Wrap',
    price: 8.99,
    category: 'wraps',
    description: 'Fresh vegetables, hummus, spinach tortilla',
    keywords: ['wrap', 'veggie', 'vegetarian', 'vegetables']
  },
  {
    id: 5,
    name: 'BBQ Pulled Pork',
    price: 13.99,
    category: 'sandwiches',
    description: 'Slow cooked pork, BBQ sauce, coleslaw',
    keywords: ['pork', 'bbq', 'pulled', 'sandwich']
  },
  {
    id: 6,
    name: 'Loaded Nachos',
    price: 11.99,
    category: 'appetizers',
    description: 'Tortilla chips, cheese, jalapeños, sour cream',
    keywords: ['nachos', 'loaded', 'cheese']
  }
];

function App() {
  const [cart, setCart] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState('');

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript && !listening) {
      processVoiceOrder(transcript);
    }
  }, [transcript, listening]);

  const processVoiceOrder = (spokenText) => {
    setIsProcessing(true);
    
    // Simple NLP for menu item matching
    const foundItems = [];
    const lowerText = spokenText.toLowerCase();

    // Check for quantities
    const quantityMatch = lowerText.match(/(\d+|one|two|three|four|five)/);
    let quantity = 1;

    if (quantityMatch) {
      const numWord = quantityMatch[0];
      const numMap = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5
      };
      quantity = numMap[numWord] || parseInt(numWord) || 1;
    }

    // Find matching menu items
    FOOD_TRUCK_MENU.forEach(item => {
  // Try to match full item name first (ignoring case)
  if (lowerText.includes(item.name.toLowerCase())) {
    foundItems.push({ ...item, quantity });
    return;
  }
  // Otherwise, match only if ALL keywords are present for multi-word items
  if (
    item.keywords.length > 1 &&
    item.keywords.every(keyword => lowerText.includes(keyword.toLowerCase()))
  ) {
    foundItems.push({ ...item, quantity });
    return;
  }
  // For single-keyword items, match if keyword is present
  if (
    item.keywords.length === 1 &&
    lowerText.includes(item.keywords[0].toLowerCase())
  ) {
    foundItems.push({ ...item, quantity });
  }
});


    if (foundItems.length > 0) {
      setCart(prevCart => [...prevCart, ...foundItems]);
      
      const itemNames = foundItems.map(item => 
        `${item.quantity} ${item.name}`
      ).join(', ');
      
      const message = `Added ${itemNames} to your cart!`;
      setOrderConfirmation(message);
      
      // Text to speech confirmation
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
      }
    } else {
      const errorMessage = "Sorry, I couldn't find that item on our menu.";
      setOrderConfirmation(errorMessage);
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(errorMessage);
        window.speechSynthesis.speak(utterance);
      }
    }

    setTimeout(() => {
      setIsProcessing(false);
      setOrderConfirmation('');
    }, 3000);
  };

  const startListening = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: false });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  const addToCart = (item) => {
    const cartItem = { ...item, cartId: Date.now(), quantity: 1 };
    setCart(prevCart => [...prevCart, cartItem]);
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`Added ${item.name} to cart`);
      window.speechSynthesis.speak(utterance);
    }
  };

  const removeFromCart = (cartId) => {
    setCart(prevCart => prevCart.filter(item => item.cartId !== cartId));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const clearCart = () => {
    setCart([]);
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Cart cleared');
      window.speechSynthesis.speak(utterance);
    }
  };

  const placeOrder = () => {
    if (cart.length === 0) {
      alert('Please add items to your cart first.');
      return;
    }

    const total = calculateTotal();
    const confirmed = window.confirm(`Total: $${total.toFixed(2)}\n\nPlace your order?`);
    
    if (confirmed) {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          `Order placed! Total is $${total.toFixed(2)}. Please proceed to the food truck for payment.`
        );
        window.speechSynthesis.speak(utterance);
      }
      alert('Order placed! Thank you for your order. Please proceed to the truck for payment and pickup.');
      clearCart();
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="App">
        <div className="error">
          <h2>🚫 Browser doesn't support speech recognition</h2>
          <p>Please use Chrome, Edge, or Safari for voice features.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Header */}
      <header className="app-header">
        <h1>🚚 Food Truck Voice Assistant</h1>
        <p>Click microphone to order by voice or browse menu below</p>
      </header>

      {/* Voice Control Section */}
      <div className="voice-section">
        <div className="voice-controls">
          <button
            className={`mic-button ${listening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}
            onClick={listening ? stopListening : startListening}
            disabled={isProcessing}
          >
            {listening ? '🎙️' : '🎤'}
          </button>
          
          <div className="voice-status">
            {isProcessing ? 'Processing your order...' :
             listening ? 'Listening... Speak your order!' :
             'Click microphone to order by voice'}
          </div>
        </div>

        {transcript && (
          <div className="transcript">
            <strong>You said:</strong> "{transcript}"
          </div>
        )}

        {orderConfirmation && (
          <div className="order-confirmation">
            {orderConfirmation}
          </div>
        )}
      </div>

      {/* Menu Section */}
      <div className="menu-section">
        <h2>🍽️ Menu</h2>
        <div className="menu-grid">
          {FOOD_TRUCK_MENU.map(item => (
            <div key={item.id} className="menu-item">
              <div className="item-info">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className="item-price">${item.price.toFixed(2)}</div>
              </div>
              <button 
                className="add-button"
                onClick={() => addToCart(item)}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      {cart.length > 0 && (
        <div className="cart-section">
          <div className="cart-header">
            <h2>🛒 Your Order</h2>
            <button className="clear-button" onClick={clearCart}>
              Clear Cart
            </button>
          </div>
          
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.cartId} className="cart-item">
                <div className="cart-item-info">
                  <strong>{item.name}</strong>
                  <span>${item.price.toFixed(2)} × {item.quantity} = ${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <button 
                  className="remove-button"
                  onClick={() => removeFromCart(item.cartId)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          
          <div className="cart-total">
            <strong>Total: ${calculateTotal().toFixed(2)}</strong>
          </div>
          
          <button className="checkout-button" onClick={placeOrder}>
            Place Order
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="instructions">
        <h3>🎙️ Voice Commands</h3>
        <p>Try saying: "I want a burger", "Two tacos please", "Fish and chips", "Add nachos"</p>
      </div>
    </div>
  );
}

export default App;
