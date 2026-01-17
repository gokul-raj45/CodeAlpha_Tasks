package com.techcart.service;

import com.techcart.model.CartItem;
import com.techcart.model.Product;
import com.techcart.repository.CartItemRepository;
import com.techcart.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    @Autowired
    public CartService(CartItemRepository cartItemRepository, ProductRepository productRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    public List<CartItem> getCartItems(String sessionId) {
        return cartItemRepository.findBySessionId(sessionId);
    }

    public Integer getCartItemCount(String sessionId) {
        List<CartItem> items = cartItemRepository.findBySessionId(sessionId);
        return items.stream()
                .mapToInt(CartItem::getQuantity)
                .sum();
    }

    public Double getCartTotal(String sessionId) {
        List<CartItem> items = cartItemRepository.findBySessionId(sessionId);
        return items.stream()
                .mapToDouble(CartItem::getTotalPrice)
                .sum();
    }

    @Transactional
    public void addToCart(String sessionId, Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStock() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }

        CartItem existingItem = cartItemRepository.findBySessionIdAndProductId(sessionId, productId);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = new CartItem(product, quantity, sessionId);
            cartItemRepository.save(newItem);
        }
    }

    @Transactional
    public void updateCartItemQuantity(String sessionId, Long cartItemId, Integer quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getSessionId().equals(sessionId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
        } else {
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        }
    }

    @Transactional
    public void removeFromCart(String sessionId, Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getSessionId().equals(sessionId)) {
            throw new RuntimeException("Unauthorized");
        }

        cartItemRepository.delete(cartItem);
    }

    @Transactional
    public void clearCart(String sessionId) {
        cartItemRepository.deleteBySessionId(sessionId);
    }
}
