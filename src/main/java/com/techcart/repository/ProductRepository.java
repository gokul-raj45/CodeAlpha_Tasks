package com.techcart.repository;

import com.techcart.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // Find products by category
    List<Product> findByCategory(String category);
    
    // Find products by name containing (case-insensitive)
    List<Product> findByNameContainingIgnoreCase(String name);
}
