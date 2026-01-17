package com.techcart.controller;

import com.techcart.model.Product;
import com.techcart.service.CartService;
import com.techcart.service.ProductService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
public class ProductController {

    private final ProductService productService;
    private final CartService cartService;

    @Autowired
    public ProductController(ProductService productService, CartService cartService) {
        this.productService = productService;
        this.cartService = cartService;
    }

    // Home page - display all products with search and filter
    @GetMapping("/")
    public String home(@RequestParam(required = false) String search,
                       @RequestParam(required = false) String category,
                       Model model, HttpSession session) {
        List<Product> products;
        
        if (search != null && !search.trim().isEmpty()) {
            products = productService.searchProducts(search);
        } else if (category != null && !category.trim().isEmpty()) {
            products = productService.getProductsByCategory(category);
        } else {
            products = productService.getAllProducts();
        }

        String sessionId = session.getId();
        model.addAttribute("products", products);
        model.addAttribute("categories", productService.getAllCategories());
        model.addAttribute("cartItemCount", cartService.getCartItemCount(sessionId));
        model.addAttribute("searchTerm", search != null ? search : "");
        model.addAttribute("selectedCategory", category != null ? category : "");
        return "index";
    }

    // Product detail page
    @GetMapping("/product/{id}")
    public String productDetail(@PathVariable Long id, Model model, HttpSession session) {
        Product product = productService.getProductById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        String sessionId = session.getId();
        model.addAttribute("product", product);
        model.addAttribute("cartItemCount", cartService.getCartItemCount(sessionId));
        return "product-detail";
    }

    // Add to cart
    @PostMapping("/cart/add")
    public String addToCart(@RequestParam Long productId,
                           @RequestParam(defaultValue = "1") Integer quantity,
                           HttpSession session) {
        String sessionId = session.getId();
        cartService.addToCart(sessionId, productId, quantity);
        return "redirect:/";
    }

    // View cart
    @GetMapping("/cart")
    public String viewCart(Model model, HttpSession session) {
        String sessionId = session.getId();
        model.addAttribute("cartItems", cartService.getCartItems(sessionId));
        model.addAttribute("cartTotal", cartService.getCartTotal(sessionId));
        model.addAttribute("cartItemCount", cartService.getCartItemCount(sessionId));
        return "cart";
    }

    // Update cart item quantity
    @PostMapping("/cart/update")
    public String updateCartItem(@RequestParam Long cartItemId,
                                @RequestParam Integer quantity,
                                HttpSession session) {
        String sessionId = session.getId();
        cartService.updateCartItemQuantity(sessionId, cartItemId, quantity);
        return "redirect:/cart";
    }

    // Remove from cart
    @GetMapping("/cart/remove/{id}")
    public String removeFromCart(@PathVariable Long id, HttpSession session) {
        String sessionId = session.getId();
        cartService.removeFromCart(sessionId, id);
        return "redirect:/cart";
    }

    // Clear cart
    @GetMapping("/cart/clear")
    public String clearCart(HttpSession session) {
        String sessionId = session.getId();
        cartService.clearCart(sessionId);
        return "redirect:/cart";
    }
}
