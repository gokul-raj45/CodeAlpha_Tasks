package com.techcart.repository;

import com.techcart.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    
    List<CartItem> findBySessionId(String sessionId);
    
    CartItem findBySessionIdAndProductId(String sessionId, Long productId);
    
    void deleteBySessionId(String sessionId);
}
